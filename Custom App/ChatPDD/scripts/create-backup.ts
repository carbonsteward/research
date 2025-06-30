#!/usr/bin/env tsx

/**
 * Enhanced Database Backup Script for Collaboration Features
 * Creates comprehensive backups with metadata and verification
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'

interface BackupConfig {
  environment: 'development' | 'staging' | 'production'
  backupId: string
  includeCollaborationData: boolean
  compression: 'none' | 'gzip' | 'brotli'
  uploadToCloud: boolean
  retentionDays: number
}

interface BackupMetadata {
  backupId: string
  timestamp: string
  environment: string
  databaseSize: number
  tableCount: number
  recordCount: number
  collaborationTables: string[]
  schemaVersion: string
  compressionType: string
  checksumMd5: string
  storageLocation: string
}

class DatabaseBackupManager {
  private prisma: PrismaClient
  private config: BackupConfig
  private s3Client?: S3Client

  constructor(config: BackupConfig) {
    this.config = config
    this.prisma = new PrismaClient()

    if (config.uploadToCloud) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
    }
  }

  async createBackup(): Promise<BackupMetadata> {
    console.log(`🚀 Starting backup creation: ${this.config.backupId}`)

    try {
      // Step 1: Pre-backup validation
      await this.validateDatabase()

      // Step 2: Create backup directory
      const backupDir = await this.createBackupDirectory()

      // Step 3: Gather database metadata
      const metadata = await this.gatherDatabaseMetadata()

      // Step 4: Create schema backup
      await this.backupSchema(backupDir)

      // Step 5: Create data backup
      await this.backupData(backupDir)

      // Step 6: Create collaboration-specific backup
      if (this.config.includeCollaborationData) {
        await this.backupCollaborationData(backupDir)
      }

      // Step 7: Compress backup if requested
      const finalPath = await this.compressBackup(backupDir)

      // Step 8: Upload to cloud storage if configured
      if (this.config.uploadToCloud) {
        await this.uploadToCloud(finalPath)
      }

      // Step 9: Generate final metadata
      const finalMetadata = await this.generateFinalMetadata(finalPath, metadata)

      // Step 10: Save metadata
      await this.saveMetadata(finalMetadata)

      console.log(`✅ Backup completed successfully: ${this.config.backupId}`)
      return finalMetadata

    } catch (error) {
      console.error('❌ Backup failed:', error)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }

  private async validateDatabase(): Promise<void> {
    console.log('🔍 Validating database connection...')

    try {
      await this.prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection validated')
    } catch (error) {
      throw new Error(`Database validation failed: ${error}`)
    }
  }

  private async createBackupDirectory(): Promise<string> {
    const backupDir = path.join(process.cwd(), 'backups', this.config.backupId)

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    return backupDir
  }

  private async gatherDatabaseMetadata(): Promise<Partial<BackupMetadata>> {
    console.log('📊 Gathering database metadata...')

    // Get table count
    const tableCount = await this.getTableCount()

    // Get approximate record count
    const recordCount = await this.getRecordCount()

    // Get database size
    const databaseSize = await this.getDatabaseSize()

    // Get collaboration tables
    const collaborationTables = await this.getCollaborationTables()

    // Get schema version from migrations
    const schemaVersion = await this.getSchemaVersion()

    return {
      tableCount,
      recordCount,
      databaseSize,
      collaborationTables,
      schemaVersion,
    }
  }

  private async getTableCount(): Promise<number> {
    const result = await this.prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `
    return Number(result[0].count)
  }

  private async getRecordCount(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<{total: bigint}[]>`
        SELECT SUM(n_tup_ins + n_tup_upd + n_tup_del) as total
        FROM pg_stat_user_tables
      `
      return Number(result[0].total || 0)
    } catch {
      return 0
    }
  }

  private async getDatabaseSize(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<{size: bigint}[]>`
        SELECT pg_database_size(current_database()) as size
      `
      return Number(result[0].size)
    } catch {
      return 0
    }
  }

  private async getCollaborationTables(): Promise<string[]> {
    const collaborationTableNames = [
      'Workspace',
      'WorkspaceMember',
      'ProjectTeamMember',
      'ProjectComment',
      'ProjectActivity',
      'Notification',
      'SharedResource',
      'Role',
      'Permission',
      'UserRole',
      'RolePermission',
      'UserPermission',
      'UserSession',
      'Organization',
      'OrganizationMember',
    ]

    const result = await this.prisma.$queryRaw<{table_name: string}[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ANY(${collaborationTableNames})
    `

    return result.map(row => row.table_name)
  }

  private async getSchemaVersion(): Promise<string> {
    try {
      const result = await this.prisma.$queryRaw<{migration_name: string}[]>`
        SELECT migration_name
        FROM _prisma_migrations
        ORDER BY finished_at DESC
        LIMIT 1
      `
      return result[0]?.migration_name || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private async backupSchema(backupDir: string): Promise<void> {
    console.log('📋 Creating schema backup...')

    const schemaPath = path.join(backupDir, 'schema.sql')

    // Use pg_dump to extract schema only
    const databaseUrl = process.env.DATABASE_URL!
    const command = `pg_dump "${databaseUrl}" --schema-only --no-owner --no-privileges -f "${schemaPath}"`

    try {
      execSync(command, { stdio: 'pipe' })
      console.log('✅ Schema backup created')
    } catch (error) {
      throw new Error(`Schema backup failed: ${error}`)
    }
  }

  private async backupData(backupDir: string): Promise<void> {
    console.log('💾 Creating data backup...')

    const dataPath = path.join(backupDir, 'data.sql')

    // Use pg_dump to extract data only
    const databaseUrl = process.env.DATABASE_URL!
    const command = `pg_dump "${databaseUrl}" --data-only --no-owner --no-privileges --insert -f "${dataPath}"`

    try {
      execSync(command, { stdio: 'pipe' })
      console.log('✅ Data backup created')
    } catch (error) {
      throw new Error(`Data backup failed: ${error}`)
    }
  }

  private async backupCollaborationData(backupDir: string): Promise<void> {
    console.log('👥 Creating collaboration data backup...')

    const collaborationPath = path.join(backupDir, 'collaboration.json')

    // Export collaboration data as JSON for easier analysis
    const collaborationData = {
      workspaces: await this.prisma.workspace.findMany({
        include: {
          members: true,
          projects: {
            select: { id: true, name: true, visibility: true }
          }
        }
      }),
      projectTeamMembers: await this.prisma.projectTeamMember.findMany(),
      notifications: await this.prisma.notification.count(),
      sharedResources: await this.prisma.sharedResource.count(),
      userSessions: await this.prisma.userSession.count({
        where: { isActive: true }
      }),
      roles: await this.prisma.role.findMany({
        include: {
          rolePermissions: {
            include: { permission: true }
          }
        }
      })
    }

    fs.writeFileSync(collaborationPath, JSON.stringify(collaborationData, null, 2))
    console.log('✅ Collaboration data backup created')
  }

  private async compressBackup(backupDir: string): Promise<string> {
    if (this.config.compression === 'none') {
      return backupDir
    }

    console.log(`🗜️ Compressing backup with ${this.config.compression}...`)

    const archivePath = `${backupDir}.tar.gz`
    const command = `tar -czf "${archivePath}" -C "${path.dirname(backupDir)}" "${path.basename(backupDir)}"`

    try {
      execSync(command, { stdio: 'pipe' })

      // Remove uncompressed directory
      fs.rmSync(backupDir, { recursive: true })

      console.log('✅ Backup compressed successfully')
      return archivePath
    } catch (error) {
      throw new Error(`Compression failed: ${error}`)
    }
  }

  private async uploadToCloud(filePath: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured')
    }

    console.log('☁️ Uploading backup to cloud storage...')

    const bucketName = process.env.BACKUP_STORAGE_BUCKET || 'chatpdd-backups'
    const key = `${this.config.environment}/${this.config.backupId}/${path.basename(filePath)}`

    try {
      const fileContent = fs.readFileSync(filePath)

      await this.s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        StorageClass: 'STANDARD_IA',
        ServerSideEncryption: 'AES256',
        Metadata: {
          environment: this.config.environment,
          backupId: this.config.backupId,
          createdAt: new Date().toISOString(),
        }
      }))

      console.log('✅ Backup uploaded to cloud storage')
      return `s3://${bucketName}/${key}`
    } catch (error) {
      throw new Error(`Cloud upload failed: ${error}`)
    }
  }

  private async generateFinalMetadata(backupPath: string, metadata: Partial<BackupMetadata>): Promise<BackupMetadata> {
    // Calculate MD5 checksum
    const checksumMd5 = await this.calculateChecksum(backupPath)

    return {
      backupId: this.config.backupId,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      databaseSize: metadata.databaseSize || 0,
      tableCount: metadata.tableCount || 0,
      recordCount: metadata.recordCount || 0,
      collaborationTables: metadata.collaborationTables || [],
      schemaVersion: metadata.schemaVersion || 'unknown',
      compressionType: this.config.compression,
      checksumMd5,
      storageLocation: backupPath,
    }
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto')
    const hash = crypto.createHash('md5')
    const fileContent = fs.readFileSync(filePath)
    hash.update(fileContent)
    return hash.digest('hex')
  }

  private async saveMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(path.dirname(metadata.storageLocation), `${this.config.backupId}.metadata.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    // Also save to database for tracking
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'BACKUP_CREATED',
          entity: 'DATABASE',
          entityId: this.config.backupId,
          metadata: metadata as any,
          timestamp: new Date(),
        }
      })
    } catch (error) {
      console.warn('⚠️ Could not save backup metadata to database:', error)
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    const backupsDir = path.join(process.cwd(), 'backups')

    if (!fs.existsSync(backupsDir)) {
      return []
    }

    const backups: BackupMetadata[] = []
    const entries = fs.readdirSync(backupsDir)

    for (const entry of entries) {
      const metadataPath = path.join(backupsDir, entry, `${entry}.metadata.json`)
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
          backups.push(metadata)
        } catch (error) {
          console.warn(`⚠️ Could not read metadata for backup ${entry}:`, error)
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  async cleanupOldBackups(): Promise<void> {
    console.log('🧹 Cleaning up old backups...')

    const backups = await this.listBackups()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    for (const backup of backups) {
      if (new Date(backup.timestamp) < cutoffDate) {
        console.log(`🗑️ Removing old backup: ${backup.backupId}`)

        try {
          if (fs.existsSync(backup.storageLocation)) {
            if (fs.statSync(backup.storageLocation).isDirectory()) {
              fs.rmSync(backup.storageLocation, { recursive: true })
            } else {
              fs.unlinkSync(backup.storageLocation)
            }
          }
        } catch (error) {
          console.warn(`⚠️ Could not remove backup ${backup.backupId}:`, error)
        }
      }
    }

    console.log('✅ Backup cleanup completed')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)

  const config: BackupConfig = {
    environment: (args.find(arg => arg.startsWith('--environment='))?.split('=')[1] as any) || 'development',
    backupId: args.find(arg => arg.startsWith('--backup-id='))?.split('=')[1] || `backup_${Date.now()}`,
    includeCollaborationData: args.includes('--include-collaboration-data=true'),
    compression: (args.find(arg => arg.startsWith('--compression='))?.split('=')[1] as any) || 'gzip',
    uploadToCloud: args.includes('--upload-to-cloud=true'),
    retentionDays: parseInt(args.find(arg => arg.startsWith('--retention-days='))?.split('=')[1] || '30'),
  }

  if (args.includes('--help')) {
    console.log(`
Database Backup Manager

Usage: tsx scripts/create-backup.ts [options]

Options:
  --environment=<env>              Target environment (development|staging|production)
  --backup-id=<id>                 Unique backup identifier
  --include-collaboration-data=<bool> Include collaboration-specific data export
  --compression=<type>             Compression type (none|gzip|brotli)
  --upload-to-cloud=<bool>         Upload to cloud storage
  --retention-days=<days>          Backup retention period
  --list                           List available backups
  --cleanup                        Remove old backups
  --help                           Show this help message

Examples:
  tsx scripts/create-backup.ts --environment=production --backup-id=pre_migration_backup
  tsx scripts/create-backup.ts --include-collaboration-data=true --upload-to-cloud=true
  tsx scripts/create-backup.ts --list
  tsx scripts/create-backup.ts --cleanup
    `)
    process.exit(0)
  }

  const manager = new DatabaseBackupManager(config)

  try {
    if (args.includes('--list')) {
      const backups = await manager.listBackups()
      console.log('📋 Available backups:')
      console.table(backups.map(b => ({
        ID: b.backupId,
        Environment: b.environment,
        Timestamp: b.timestamp,
        Size: `${(b.databaseSize / 1024 / 1024).toFixed(2)} MB`,
        Tables: b.tableCount,
        Records: b.recordCount.toLocaleString(),
      })))
    } else if (args.includes('--cleanup')) {
      await manager.cleanupOldBackups()
    } else {
      const metadata = await manager.createBackup()
      console.log('📊 Backup Summary:')
      console.table({
        'Backup ID': metadata.backupId,
        'Environment': metadata.environment,
        'Size': `${(metadata.databaseSize / 1024 / 1024).toFixed(2)} MB`,
        'Tables': metadata.tableCount,
        'Records': metadata.recordCount.toLocaleString(),
        'Checksum': metadata.checksumMd5,
        'Location': metadata.storageLocation,
      })
    }
  } catch (error) {
    console.error('💥 Backup operation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { DatabaseBackupManager, BackupConfig, BackupMetadata }

import { prisma } from '../lib/prisma'

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test query execution
    const carbonStandardsCount = await prisma.carbonStandard.count()
    console.log(`📊 Carbon Standards in database: ${carbonStandardsCount}`)

    const methodologiesCount = await prisma.methodology.count()
    console.log(`📊 Methodologies in database: ${methodologiesCount}`)

    // Test complex query with relations
    const standardsWithMethodologies = await prisma.carbonStandard.findMany({
      include: {
        methodologies: {
          take: 2,
        },
        _count: {
          select: {
            methodologies: true,
          },
        },
      },
      take: 3,
    })

    console.log('\n📋 Sample Standards with Methodologies:')
    for (const standard of standardsWithMethodologies) {
      console.log(`  • ${standard.name} (${standard.abbreviation})`)
      console.log(`    Total methodologies: ${standard._count.methodologies}`)

      if (standard.methodologies.length > 0) {
        console.log('    Sample methodologies:')
        for (const methodology of standard.methodologies) {
          console.log(`      - ${methodology.name} (${methodology.type})`)
        }
      }
      console.log('')
    }

    // Test enum queries
    const projectsByType = await prisma.project.groupBy({
      by: ['projectType'],
      _count: {
        id: true,
      },
    })

    if (projectsByType.length > 0) {
      console.log('📈 Projects by type:')
      for (const group of projectsByType) {
        console.log(`  • ${group.projectType}: ${group._count.id} projects`)
      }
    } else {
      console.log('📈 No projects found (expected for fresh database)')
    }

    console.log('\n🎉 Database connection test completed successfully!')

  } catch (error) {
    console.error('❌ Database connection test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed.')
  }
}

// Run the test
testDatabaseConnection()

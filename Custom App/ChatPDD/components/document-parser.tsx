"use client"

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  Upload,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileImage,
  FileSpreadsheet,
  Loader2,
  Search,
  Target,
  Shield,
  Book,
  Calendar,
  DollarSign,
  MapPin,
  Leaf,
  Users,
  Zap,
  BarChart3,
  Settings,
  Brain,
  Scan
} from 'lucide-react'

interface DocumentMetadata {
  id: string
  fileName: string
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'text'
  fileSize: number
  uploadDate: string
  status: 'uploaded' | 'processing' | 'analyzed' | 'error'
  thumbnail?: string
}

interface ExtractedContent {
  text: string
  tables: Array<{
    id: string
    title?: string
    headers: string[]
    rows: string[][]
    analysis: string
  }>
  images: Array<{
    id: string
    description: string
    coordinates?: { lat: number; lng: number }
    relevance: number
  }>
  charts: Array<{
    id: string
    type: 'bar' | 'line' | 'pie' | 'scatter'
    title: string
    data: any
    insights: string
  }>
  metadata: {
    pageCount: number
    language: string
    creationDate?: string
    author?: string
    keywords: string[]
  }
}

interface ParsedDocument {
  id: string
  metadata: DocumentMetadata
  content: ExtractedContent
  analysis: {
    documentType: 'PDD' | 'VCS_Document' | 'CDM_Document' | 'Gold_Standard' | 'Technical_Report' | 'Financial_Report' | 'Environmental_Assessment' | 'Other'
    confidence: number
    keyFindings: Array<{
      category: 'methodology' | 'location' | 'credits' | 'timeline' | 'budget' | 'risks' | 'stakeholders' | 'compliance'
      finding: string
      value?: string | number
      confidence: number
      pageReferences: number[]
    }>
    projectData: {
      name?: string
      type?: string
      location?: {
        country?: string
        region?: string
        coordinates?: string
        area?: number
      }
      methodology?: {
        name?: string
        version?: string
        standard?: string
      }
      timeline?: {
        startDate?: string
        endDate?: string
        duration?: string
      }
      credits?: {
        annual?: number
        total?: number
        price?: number
      }
      budget?: {
        total?: number
        breakdown?: Record<string, number>
      }
      stakeholders?: string[]
      risks?: Array<{
        type: string
        description: string
        likelihood: 'low' | 'medium' | 'high'
        impact: 'low' | 'medium' | 'high'
        mitigation?: string
      }>
    }
    complianceCheck: {
      standardsCompliance: Array<{
        standard: string
        compliant: boolean
        missingRequirements: string[]
        score: number
      }>
      dataQuality: {
        completeness: number
        accuracy: number
        consistency: number
        timeliness: number
      }
      recommendations: string[]
    }
    qualityScore: number
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      category: string
      description: string
      pageReference?: number
      suggestion?: string
    }>
  }
}

interface DocumentParserProps {
  maxFiles?: number
  allowedTypes?: string[]
  onDocumentParsed?: (document: ParsedDocument) => void
  onError?: (error: string) => void
  className?: string
}

export function DocumentParser({
  maxFiles = 10,
  allowedTypes = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'],
  onDocumentParsed,
  onError,
  className = ""
}: DocumentParserProps) {
  const [documents, setDocuments] = useState<ParsedDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState<ParsedDocument | null>(null)
  const [activeView, setActiveView] = useState('upload')
  const [analysisSettings, setAnalysisSettings] = useState({
    extractTables: true,
    extractImages: true,
    performOCR: true,
    analyzeCharts: true,
    checkCompliance: true,
    extractCoordinates: true,
    validateData: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 500))
        setUploadProgress((index + 1) / files.length * 100)

        const metadata: DocumentMetadata = {
          id: `doc-${Date.now()}-${index}`,
          fileName: file.name,
          fileType: getFileType(file.name),
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          status: 'uploaded'
        }

        return metadata
      })

      const uploadedMetadata = await Promise.all(uploadPromises)

      // Start processing documents
      setProcessing(true)
      setProcessingProgress(0)

      for (let i = 0; i < uploadedMetadata.length; i++) {
        const metadata = uploadedMetadata[i]

        // Update status to processing
        setDocuments(prev => [...prev.filter(d => d.id !== metadata.id), {
          id: metadata.id,
          metadata: { ...metadata, status: 'processing' },
          content: {} as ExtractedContent,
          analysis: {} as ParsedDocument['analysis']
        }])

        // Simulate document processing
        const parsedDoc = await processDocument(metadata)

        setDocuments(prev => [...prev.filter(d => d.id !== metadata.id), parsedDoc])
        setProcessingProgress((i + 1) / uploadedMetadata.length * 100)

        if (onDocumentParsed) {
          onDocumentParsed(parsedDoc)
        }
      }

    } catch (error) {
      console.error('Error uploading documents:', error)
      if (onError) {
        onError('Failed to upload or process documents')
      }
    } finally {
      setUploading(false)
      setProcessing(false)
      setUploadProgress(0)
      setProcessingProgress(0)
    }
  }, [onDocumentParsed, onError])

  const processDocument = async (metadata: DocumentMetadata): Promise<ParsedDocument> => {
    // Simulate AI-powered document processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    return generateMockParsedDocument(metadata)
  }

  const generateMockParsedDocument = (metadata: DocumentMetadata): ParsedDocument => {
    const isPDD = metadata.fileName.toLowerCase().includes('pdd') ||
                  metadata.fileName.toLowerCase().includes('project design')

    return {
      id: metadata.id,
      metadata: { ...metadata, status: 'analyzed' },
      content: {
        text: `This is a sample extracted content from ${metadata.fileName}. The document contains project information, methodology details, and carbon credit calculations.`,
        tables: [
          {
            id: 'table-1',
            title: 'Emission Reduction Calculations',
            headers: ['Year', 'Baseline Emissions', 'Project Emissions', 'Emission Reductions'],
            rows: [
              ['2024', '15,000', '3,000', '12,000'],
              ['2025', '15,500', '2,800', '12,700'],
              ['2026', '16,000', '2,600', '13,400']
            ],
            analysis: 'Shows consistent emission reductions over the crediting period'
          }
        ],
        images: [
          {
            id: 'img-1',
            description: 'Project location map showing forest area',
            coordinates: { lat: -15.7801, lng: -47.9292 },
            relevance: 95
          }
        ],
        charts: [
          {
            id: 'chart-1',
            type: 'bar',
            title: 'Annual Emission Reductions',
            data: { years: ['2024', '2025', '2026'], values: [12000, 12700, 13400] },
            insights: 'Emission reductions are increasing year over year'
          }
        ],
        metadata: {
          pageCount: 45,
          language: 'en',
          creationDate: '2024-01-15',
          author: 'Project Developer',
          keywords: ['AFOLU', 'forest conservation', 'REDD+', 'carbon credits']
        }
      },
      analysis: {
        documentType: isPDD ? 'PDD' : 'Technical_Report',
        confidence: 92,
        keyFindings: [
          {
            category: 'methodology',
            finding: 'VM0007 REDD+ Methodology Framework (REDD-MF) v1.6',
            confidence: 95,
            pageReferences: [3, 15]
          },
          {
            category: 'location',
            finding: 'Project located in Cerrado biome, Brazil',
            value: 'Brazil, Mato Grosso',
            confidence: 88,
            pageReferences: [5, 12]
          },
          {
            category: 'credits',
            finding: 'Annual emission reductions',
            value: 12700,
            confidence: 90,
            pageReferences: [22, 35]
          },
          {
            category: 'timeline',
            finding: 'Crediting period',
            value: '10 years (2024-2034)',
            confidence: 85,
            pageReferences: [8]
          }
        ],
        projectData: {
          name: 'Cerrado Forest Conservation Project',
          type: 'AFOLU',
          location: {
            country: 'Brazil',
            region: 'Mato Grosso',
            coordinates: '-15.7801,-47.9292',
            area: 50000
          },
          methodology: {
            name: 'VM0007 REDD+ Methodology Framework',
            version: 'v1.6',
            standard: 'VCS'
          },
          timeline: {
            startDate: '2024-01-01',
            endDate: '2034-12-31',
            duration: '10 years'
          },
          credits: {
            annual: 12700,
            total: 127000,
            price: 15
          },
          budget: {
            total: 2500000,
            breakdown: {
              'Implementation': 1500000,
              'Monitoring': 500000,
              'Validation': 300000,
              'Other': 200000
            }
          },
          stakeholders: ['Local Communities', 'Government Agencies', 'NGOs'],
          risks: [
            {
              type: 'Leakage',
              description: 'Displacement of deforestation activities',
              likelihood: 'medium',
              impact: 'high',
              mitigation: 'Monitoring beyond project boundaries'
            }
          ]
        },
        complianceCheck: {
          standardsCompliance: [
            {
              standard: 'VCS',
              compliant: true,
              missingRequirements: [],
              score: 95
            }
          ],
          dataQuality: {
            completeness: 90,
            accuracy: 88,
            consistency: 92,
            timeliness: 85
          },
          recommendations: [
            'Include more detailed monitoring plan',
            'Provide additional stakeholder consultation evidence',
            'Add risk mitigation strategies'
          ]
        },
        qualityScore: 87,
        issues: [
          {
            type: 'warning',
            category: 'data',
            description: 'Some baseline data points are missing',
            pageReference: 18,
            suggestion: 'Include complete baseline dataset'
          }
        ]
      }
    }
  }

  const getFileType = (fileName: string): DocumentMetadata['fileType'] => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf': return 'pdf'
      case 'docx': case 'doc': return 'word'
      case 'xlsx': case 'xls': return 'excel'
      case 'png': case 'jpg': case 'jpeg': return 'image'
      default: return 'text'
    }
  }

  const getFileTypeIcon = (fileType: DocumentMetadata['fileType']) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />
      case 'word': return <FileText className="h-5 w-5 text-blue-600" />
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case 'image': return <FileImage className="h-5 w-5 text-purple-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: DocumentMetadata['status']) => {
    switch (status) {
      case 'uploaded': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'analyzed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportAnalysis = (document: ParsedDocument) => {
    const exportData = {
      document: document,
      exportedAt: new Date().toISOString(),
      settings: analysisSettings
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-analysis-${document.metadata.fileName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Document Parser
            </CardTitle>
            <CardDescription>
              Extract and analyze project documentation with AI-powered content understanding
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedDocument && (
              <Button variant="outline" onClick={() => exportAnalysis(selectedDocument)}>
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    handleFileUpload(files)
                  }
                }}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Project Documents
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  {allowedTypes.map(type => (
                    <Badge key={type} variant="outline">{type}</Badge>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={allowedTypes.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files)
                    }
                  }}
                />
              </div>

              {/* Upload Progress */}
              {(uploading || processing) && (
                <div className="space-y-4">
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading documents...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {processing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing with AI analysis...
                        </span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                      <p className="text-xs text-gray-600">
                        Extracting text, analyzing content, and checking compliance...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              {documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Total Documents</p>
                          <p className="text-2xl font-bold text-blue-900">{documents.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Analyzed</p>
                          <p className="text-2xl font-bold text-green-900">
                            {documents.filter(d => d.metadata.status === 'analyzed').length}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Avg Quality</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {Math.round(documents.reduce((acc, doc) => acc + (doc.analysis.qualityScore || 0), 0) / documents.length) || 0}%
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600">Issues Found</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {documents.reduce((acc, doc) => acc + (doc.analysis.issues?.length || 0), 0)}
                          </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                  <Button
                    onClick={() => setActiveView('upload')}
                    className="mt-4"
                  >
                    Upload Documents
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`cursor-pointer transition-colors ${
                        selectedDocument?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFileTypeIcon(doc.metadata.fileType)}
                            <div>
                              <h4 className="font-medium">{doc.metadata.fileName}</h4>
                              <p className="text-sm text-gray-600">
                                {(doc.metadata.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.content.metadata?.pageCount} pages
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.metadata.status)}>
                              {doc.metadata.status}
                            </Badge>
                            {doc.analysis.qualityScore && (
                              <Badge variant="outline">
                                {doc.analysis.qualityScore}% quality
                              </Badge>
                            )}
                          </div>
                        </div>

                        {doc.analysis.keyFindings && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                            {doc.analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                              <div key={idx} className="bg-white rounded border p-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  {finding.category}
                                </p>
                                <p className="text-sm font-medium truncate" title={finding.finding}>
                                  {finding.value || finding.finding}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            {selectedDocument ? (
              <div className="space-y-6">
                {/* Document Analysis Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.metadata.fileName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge>{selectedDocument.analysis.documentType}</Badge>
                      <Badge variant="outline">{selectedDocument.analysis.confidence}% confidence</Badge>
                      <Badge variant="outline">{selectedDocument.analysis.qualityScore}% quality</Badge>
                    </div>
                  </div>
                  <Button onClick={() => exportAnalysis(selectedDocument)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Key Findings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {selectedDocument.analysis.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {finding.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {finding.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="font-medium">{finding.finding}</p>
                            {finding.value && (
                              <p className="text-sm text-gray-600 mt-1">Value: {finding.value}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Pages {finding.pageReferences.join(', ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Project Data */}
                {selectedDocument.analysis.projectData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Extracted Project Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Basic Information</h4>
                          {selectedDocument.analysis.projectData.name && (
                            <div>
                              <p className="text-sm text-gray-600">Project Name</p>
                              <p className="font-medium">{selectedDocument.analysis.projectData.name}</p>
                            </div>
                          )}
                          {selectedDocument.analysis.projectData.type && (
                            <div>
                              <p className="text-sm text-gray-600">Type</p>
                              <p className="font-medium">{selectedDocument.analysis.projectData.type}</p>
                            </div>
                          )}
                          {selectedDocument.analysis.projectData.location && (
                            <div>
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="font-medium">
                                {selectedDocument.analysis.projectData.location.country}
                                {selectedDocument.analysis.projectData.location.region && `, ${selectedDocument.analysis.projectData.location.region}`}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Methodology & Credits */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Methodology & Credits</h4>
                          {selectedDocument.analysis.projectData.methodology && (
                            <div>
                              <p className="text-sm text-gray-600">Methodology</p>
                              <p className="font-medium">
                                {selectedDocument.analysis.projectData.methodology.name}
                                {selectedDocument.analysis.projectData.methodology.version && ` ${selectedDocument.analysis.projectData.methodology.version}`}
                              </p>
                            </div>
                          )}
                          {selectedDocument.analysis.projectData.credits && (
                            <div>
                              <p className="text-sm text-gray-600">Annual Credits</p>
                              <p className="font-medium">
                                {selectedDocument.analysis.projectData.credits.annual?.toLocaleString()} tCO2e
                              </p>
                            </div>
                          )}
                          {selectedDocument.analysis.projectData.timeline && (
                            <div>
                              <p className="text-sm text-gray-600">Timeline</p>
                              <p className="font-medium">{selectedDocument.analysis.projectData.timeline.duration}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Check */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDocument.analysis.complianceCheck.standardsCompliance.map((compliance, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {compliance.compliant ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{compliance.standard} Compliance</p>
                              {compliance.missingRequirements.length > 0 && (
                                <p className="text-sm text-red-600">
                                  Missing: {compliance.missingRequirements.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant={compliance.compliant ? "default" : "destructive"}>
                            {compliance.score}% compliant
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {selectedDocument.analysis.complianceCheck.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {selectedDocument.analysis.complianceCheck.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Issues */}
                {selectedDocument.analysis.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Issues & Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedDocument.analysis.issues.map((issue, idx) => (
                          <Alert key={idx} className={
                            issue.type === 'error' ? 'border-red-200 bg-red-50' :
                            issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                            'border-blue-200 bg-blue-50'
                          }>
                            <AlertDescription>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{issue.description}</p>
                                  {issue.suggestion && (
                                    <p className="text-sm mt-1 text-gray-600">
                                      Suggestion: {issue.suggestion}
                                    </p>
                                  )}
                                </div>
                                {issue.pageReference && (
                                  <Badge variant="outline" className="text-xs">
                                    Page {issue.pageReference}
                                  </Badge>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a document to view detailed analysis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
                <CardDescription>
                  Configure how documents are processed and analyzed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Content Extraction</h4>
                    <div className="space-y-3">
                      {Object.entries(analysisSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-sm">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <input
                            id={key}
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setAnalysisSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="rounded border-gray-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">File Limits</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="maxFiles">Maximum Files</Label>
                        <Input
                          id="maxFiles"
                          type="number"
                          value={maxFiles}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Allowed File Types</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {allowedTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

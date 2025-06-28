"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Loader2, 
  MapPin, 
  Image as ImageIcon,
  Download,
  Trash2
} from 'lucide-react'

interface PhotoLocation {
  id: string
  file: File
  imageUrl: string
  status: 'pending' | 'analyzing' | 'success' | 'error'
  result?: {
    lat: number
    lng: number
    confidence: number
    locationName?: string
    landmarks?: string[]
    processingTime?: number
  }
  error?: string
}

interface BulkPhotoUploadProps {
  onLocationsDetected?: (locations: Array<{
    id: string
    fileName: string
    lat: number
    lng: number
    confidence: number
    locationName?: string
    landmarks?: string[]
  }>) => void
  maxFiles?: number
  className?: string
}

export function BulkPhotoUpload({ 
  onLocationsDetected,
  maxFiles = 10,
  className = ""
}: BulkPhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoLocation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    if (photos.length + imageFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. ${maxFiles - photos.length} slots remaining.`)
      return
    }

    const newPhotos: PhotoLocation[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      imageUrl: URL.createObjectURL(file),
      status: 'pending'
    }))

    setPhotos(prev => [...prev, ...newPhotos])
  }, [photos.length, maxFiles])

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // Remove photo
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const updated = prev.filter(p => p.id !== photoId)
      const photoToRemove = prev.find(p => p.id === photoId)
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.imageUrl)
      }
      return updated
    })
  }, [])

  // Process single photo
  const processPhoto = async (photo: PhotoLocation): Promise<PhotoLocation> => {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(photo.file)
      const base64Data = base64.split(',')[1] // Remove data URL prefix
      
      // Call GeoSpy API
      const response = await fetch('/api/geospy/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: photo.file.type,
          userId: getUserId()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }

      if (result.success && result.data) {
        return {
          ...photo,
          status: 'success',
          result: {
            lat: result.data.coordinates.lat,
            lng: result.data.coordinates.lng,
            confidence: result.data.confidence,
            locationName: result.data.locationName,
            landmarks: result.data.landmarks || [],
            processingTime: result.data.processingTime
          }
        }
      } else {
        throw new Error('Invalid response from analysis service')
      }

    } catch (error) {
      return {
        ...photo,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Process all photos
  const processAllPhotos = async () => {
    const pendingPhotos = photos.filter(p => p.status === 'pending')
    if (pendingPhotos.length === 0) return

    setIsProcessing(true)
    setProcessingStats({
      total: pendingPhotos.length,
      completed: 0,
      successful: 0,
      failed: 0
    })

    // Update all pending photos to analyzing
    setPhotos(prev => prev.map(p => 
      p.status === 'pending' ? { ...p, status: 'analyzing' as const } : p
    ))

    // Process photos sequentially to avoid rate limiting
    for (let i = 0; i < pendingPhotos.length; i++) {
      const photo = pendingPhotos[i]
      
      try {
        const processedPhoto = await processPhoto(photo)
        
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? processedPhoto : p
        ))

        setProcessingStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          successful: processedPhoto.status === 'success' ? prev.successful + 1 : prev.successful,
          failed: processedPhoto.status === 'error' ? prev.failed + 1 : prev.failed
        }))

        // Add delay to respect rate limits
        if (i < pendingPhotos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }

      } catch (error) {
        console.error('Error processing photo:', error)
        setProcessingStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          failed: prev.failed + 1
        }))
      }
    }

    setIsProcessing(false)

    // Notify parent component with successful results
    const successfulResults = photos
      .filter(p => p.status === 'success' && p.result)
      .map(p => ({
        id: p.id,
        fileName: p.file.name,
        lat: p.result!.lat,
        lng: p.result!.lng,
        confidence: p.result!.confidence,
        locationName: p.result!.locationName,
        landmarks: p.result!.landmarks
      }))

    if (successfulResults.length > 0 && onLocationsDetected) {
      onLocationsDetected(successfulResults)
    }
  }

  // Export results as CSV
  const exportResults = () => {
    const successfulPhotos = photos.filter(p => p.status === 'success' && p.result)
    
    if (successfulPhotos.length === 0) {
      alert('No successful results to export')
      return
    }

    const csv = [
      'File Name,Latitude,Longitude,Confidence,Location Name,Landmarks',
      ...successfulPhotos.map(p => [
        p.file.name,
        p.result!.lat,
        p.result!.lng,
        p.result!.confidence,
        p.result!.locationName || '',
        (p.result!.landmarks || []).join('; ')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `geospy-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Clear all photos
  const clearAll = () => {
    photos.forEach(photo => URL.revokeObjectURL(photo.imageUrl))
    setPhotos([])
    setProcessingStats({ total: 0, completed: 0, successful: 0, failed: 0 })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Bulk Photo Location Analysis
          </div>
          <Badge variant="outline">
            {photos.length}/{maxFiles} photos
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload multiple photos to extract coordinates from all locations at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG, WebP • Max {maxFiles} files • {maxFiles - photos.length} slots remaining
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= maxFiles}
              >
                <Upload className="h-4 w-4 mr-1" />
                Select Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />
            </div>
          </div>
        </div>

        {/* Processing Stats */}
        {(isProcessing || processingStats.total > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing Progress</span>
              <span>{processingStats.completed}/{processingStats.total}</span>
            </div>
            <Progress 
              value={(processingStats.completed / Math.max(processingStats.total, 1)) * 100} 
              className="h-2"
            />
            <div className="flex gap-4 text-xs text-gray-600">
              <span>✓ Successful: {processingStats.successful}</span>
              <span>✗ Failed: {processingStats.failed}</span>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Uploaded Photos ({photos.length})</h4>
              <div className="flex gap-2">
                {!isProcessing && photos.some(p => p.status === 'pending') && (
                  <Button
                    size="sm"
                    onClick={processAllPhotos}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Analyze All Locations
                  </Button>
                )}
                {photos.some(p => p.status === 'success') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.imageUrl}
                      alt={photo.file.name}
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(photo.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate" title={photo.file.name}>
                        {photo.file.name}
                      </p>
                      <StatusIcon status={photo.status} />
                    </div>

                    {photo.status === 'success' && photo.result && (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Confidence:</span>
                          <Badge variant="outline" className="text-green-700">
                            {photo.result.confidence}%
                          </Badge>
                        </div>
                        {photo.result.locationName && (
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-mono text-xs truncate" title={photo.result.locationName}>
                              {photo.result.locationName}
                            </p>
                          </div>
                        )}
                        <div className="font-mono text-xs text-gray-600">
                          {photo.result.lat.toFixed(4)}, {photo.result.lng.toFixed(4)}
                        </div>
                      </div>
                    )}

                    {photo.status === 'error' && (
                      <Alert variant="destructive" className="p-2">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                          {photo.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper component for status icons
function StatusIcon({ status }: { status: PhotoLocation['status'] }) {
  switch (status) {
    case 'pending':
      return <div className="h-4 w-4 rounded-full bg-gray-300" />
    case 'analyzing':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    case 'success':
      return <Check className="h-4 w-4 text-green-600" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

// Helper functions
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

function getUserId(): string {
  if (typeof window === 'undefined') return 'server'

  let userId = localStorage.getItem('geospy-user-id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('geospy-user-id', userId)
  }
  return userId
}
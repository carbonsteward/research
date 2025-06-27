"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Image as ImageIcon, MapPin, Info, Loader2, AlertTriangle } from 'lucide-react'

interface GeoSpyAIProps {
  onCoordinatesDetected?: (coordinates: { lat: number; lng: number; confidence: number; locationName?: string }) => void
}

export function GeoSpyAI({ onCoordinatesDetected }: GeoSpyAIProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    lat: number
    lng: number
    confidence: number
    locationName?: string
    landmarks?: string[]
    error?: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Take a photo from camera
  const handleTakePhoto = () => {
    if (cameraRef.current && canvasRef.current) {
      const video = cameraRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg')
      setSelectedImage(imageDataUrl)
      setAnalysisResult(null)

      // Stop camera stream
      const stream = video.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Reset video source
      video.srcObject = null

      // Switch to the result view
      setActiveTab('result')
    }
  }

  // Initialize camera when camera tab is active
  const initializeCamera = async () => {
    if (cameraRef.current && activeTab === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        cameraRef.current.srcObject = stream
        await cameraRef.current.play()
      } catch (error) {
        console.error('Error accessing camera:', error)
      }
    }
  }

  // Analyze the image to detect location
  const analyzeImage = () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    // Simulate AI analysis with a timeout
    // In a real implementation, this would call an API
    setTimeout(() => {
      // Mock result - in production this would come from actual AI processing
      const mockResult = {
        lat: 37.7749 + (Math.random() * 0.01),
        lng: -122.4194 + (Math.random() * 0.01),
        confidence: Math.floor(70 + Math.random() * 25),
        locationName: "San Francisco, California",
        landmarks: ["Golden Gate Bridge", "Transamerica Pyramid", "Coit Tower"]
      }

      setAnalysisResult(mockResult)
      setIsAnalyzing(false)

      // Notify parent component
      onCoordinatesDetected?.(mockResult)
    }, 2500)
  }

  // Reset the component state
  const handleReset = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setActiveTab('upload')

    // Stop camera if it's running
    if (cameraRef.current) {
      const stream = cameraRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      cameraRef.current.srcObject = null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          GeoSpy | AI Image Location Intelligence
        </CardTitle>
        <CardDescription>
          Upload or take a photo to automatically detect geographic coordinates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedImage ? (
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value)
            if (value === 'camera') {
              setTimeout(initializeCamera, 100)
            }
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div
                className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition"
                onClick={handleUploadClick}
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">Upload an image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to upload
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="camera" className="mt-4">
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={cameraRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center">
                  <Button onClick={handleTakePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border bg-card">
              <img
                src={selectedImage}
                alt="Selected location"
                className="w-full object-contain max-h-[300px]"
              />
            </div>

            {!analysisResult && !isAnalyzing && (
              <Alert variant="outline" className="bg-muted/50">
                <Info className="h-4 w-4" />
                <AlertTitle>Ready for analysis</AlertTitle>
                <AlertDescription>
                  Click the analyze button to detect the location in this image.
                </AlertDescription>
              </Alert>
            )}

            {isAnalyzing && (
              <div className="space-y-3 py-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing image to determine geographic location...
                </p>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Location Confidence</span>
                    <Badge>{analysisResult.confidence}%</Badge>
                  </div>

                  <div className="p-3 bg-muted rounded-lg space-y-3">
                    {analysisResult.locationName && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Detected Location</span>
                        <span className="font-medium">{analysisResult.locationName}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Coordinates</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="font-mono">
                          Lat: {analysisResult.lat.toFixed(6)}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          Lng: {analysisResult.lng.toFixed(6)}
                        </Badge>
                      </div>
                    </div>

                    {analysisResult.landmarks && analysisResult.landmarks.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Detected Landmarks</span>
                        <div className="flex flex-wrap gap-1">
                          {analysisResult.landmarks.map((landmark, index) => (
                            <Badge key={index} variant="secondary">
                              {landmark}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.confidence < 70 && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Low Confidence Detection</AlertTitle>
                        <AlertDescription>
                          The location was detected with low confidence. Consider uploading a clearer image with recognizable landmarks.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        {selectedImage && !analysisResult && !isAnalyzing && (
          <Button onClick={analyzeImage}>
            Analyze Image
          </Button>
        )}
        {analysisResult && (
          <Button onClick={() => onCoordinatesDetected?.(analysisResult)}>
            Use These Coordinates
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

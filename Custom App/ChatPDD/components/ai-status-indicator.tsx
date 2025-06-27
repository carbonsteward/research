"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react'

interface AIServiceStatus {
  status: 'healthy' | 'degraded' | 'unavailable'
  timestamp: string
  services: {
    openai: boolean
    googleMaps: boolean
  }
  configuration: {
    maxImageSize: string
    supportedFormats: string
    confidenceThreshold: string
    rateLimit: string
  }
}

export function AIStatusIndicator() {
  const [status, setStatus] = useState<AIServiceStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAIServices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/geospy/analyze', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const healthData = await response.json()
      setStatus(healthData)
    } catch (error) {
      console.error('Health check failed:', error)
      setError(error instanceof Error ? error.message : 'Health check failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAIServices()
  }, [])

  const getStatusInfo = () => {
    if (!status) return { color: 'gray', text: 'Unknown', icon: AlertTriangle }

    const { openai, googleMaps } = status.services

    if (openai && googleMaps) {
      return { color: 'green', text: 'Fully Operational', icon: CheckCircle }
    } else if (openai) {
      return { color: 'yellow', text: 'Partially Available', icon: AlertTriangle }
    } else {
      return { color: 'red', text: 'Unavailable', icon: XCircle }
    }
  }

  const statusInfo = getStatusInfo()

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking AI Services...
      </Badge>
    )
  }

  if (error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        AI Services Offline
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={statusInfo.color === 'green' ? 'default' : statusInfo.color === 'yellow' ? 'secondary' : 'destructive'}
        className="flex items-center gap-1"
      >
        <statusInfo.icon className="h-3 w-3" />
        {statusInfo.text}
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        onClick={checkAIServices}
        disabled={isLoading}
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}

export function AIServicesDashboard() {
  const [status, setStatus] = useState<AIServiceStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkServices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/geospy/analyze')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to check AI services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkServices()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>AI Services Unavailable</AlertTitle>
        <AlertDescription>
          Unable to connect to AI services. Please check your configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Services Status
              </CardTitle>
              <CardDescription>
                Real-time status of GeoSpy AI components
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={checkServices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {status.services.openai ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">OpenAI Vision API</div>
                  <div className="text-sm text-muted-foreground">Image analysis service</div>
                </div>
              </div>
              <Badge variant={status.services.openai ? "default" : "destructive"}>
                {status.services.openai ? "Connected" : "Offline"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {status.services.googleMaps ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium">Google Maps API</div>
                  <div className="text-sm text-muted-foreground">Geocoding service</div>
                </div>
              </div>
              <Badge variant={status.services.googleMaps ? "default" : "secondary"}>
                {status.services.googleMaps ? "Connected" : "Optional"}
              </Badge>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-2">
            <h4 className="font-medium">Configuration</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Image Size:</span>
                <span className="font-mono">{(parseInt(status.configuration.maxImageSize) / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate Limit:</span>
                <span className="font-mono">{status.configuration.rateLimit}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence Threshold:</span>
                <span className="font-mono">{Math.round(parseFloat(status.configuration.confidenceThreshold) * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supported Formats:</span>
                <span className="font-mono text-xs">{status.configuration.supportedFormats.split(',').length} types</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!status.services.openai && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>OpenAI API Not Configured</AlertTitle>
              <AlertDescription>
                Set OPENAI_API_KEY environment variable to enable real AI analysis.
                Currently falling back to mock data.
              </AlertDescription>
            </Alert>
          )}

          {status.services.openai && !status.services.googleMaps && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertTitle>Enhanced Features Available</AlertTitle>
              <AlertDescription>
                Configure GOOGLE_MAPS_API_KEY to enable location validation and enhanced accuracy.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

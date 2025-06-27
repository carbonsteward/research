"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, MapPin, Upload, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

interface GeoSpyDashboardWidgetProps {
  className?: string
}

export function GeoSpyDashboardWidget({ className }: GeoSpyDashboardWidgetProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  // Mock recent detections data
  const recentDetections = [
    { location: "Amazon Basin, Brazil", confidence: 94, time: "2 hours ago" },
    { location: "Sahara Desert, Morocco", confidence: 87, time: "1 day ago" },
    { location: "Great Wall, China", confidence: 98, time: "3 days ago" }
  ]

  const stats = {
    totalDetections: 127,
    avgConfidence: 89,
    topLandmarks: 45
  }

  const handleQuickUpload = () => {
    router.push('/project/geospy')
  }

  const handleViewAll = () => {
    router.push('/project/geospy')
  }

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">GeoSpy AI</CardTitle>
              <CardDescription>Photo Location Intelligence</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.totalDetections}</div>
            <div className="text-xs text-muted-foreground">Locations</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.avgConfidence}%</div>
            <div className="text-xs text-muted-foreground">Avg Accuracy</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{stats.topLandmarks}</div>
            <div className="text-xs text-muted-foreground">Landmarks</div>
          </div>
        </div>

        {/* Recent Detections */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Detections</h4>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {recentDetections.map((detection, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">{detection.location}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {detection.confidence}%
                  </Badge>
                  <span className="text-muted-foreground">{detection.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleQuickUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleQuickUpload}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>

        {/* View All Link */}
        <Button
          variant="ghost"
          className="w-full text-sm"
          onClick={handleViewAll}
        >
          Open Location Intelligence
          <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
        </Button>
      </CardContent>
    </Card>
  )
}

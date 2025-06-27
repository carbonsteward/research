"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, MapPin, Upload, TrendingUp, ArrowRight, Sparkles, Zap, Target } from 'lucide-react'
import { useGeoSpyABTesting } from '@/hooks/use-ab-testing'

interface GeoSpyABTestWidgetProps {
  className?: string
}

/**
 * A/B Testing Version of GeoSpy Dashboard Widget
 * Adapts based on user's test variant assignments
 */
export function GeoSpyABTestWidget({ className }: GeoSpyABTestWidgetProps) {
  const router = useRouter()
  const {
    widgetPlacement,
    ctaVariant,
    visualVariant,
    isDualButton,
    isSingleCTA,
    isBrandedCTA,
    isProfessionalCTA,
    isGradientTheme,
    isCarbonTheme,
    isMinimalTheme,
    isHighContrastTheme,
    trackWidgetView,
    trackCTAClick,
    trackWidgetInteraction,
    isLoading
  } = useGeoSpyABTesting()

  // Track widget view when component mounts
  useEffect(() => {
    trackWidgetView()
  }, [trackWidgetView])

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg" />
  }

  // Mock stats
  const stats = {
    totalDetections: 127,
    avgConfidence: 89,
    topLandmarks: 45
  }

  const recentDetections = [
    { location: "Amazon Basin, Brazil", confidence: 94, time: "2 hours ago" },
    { location: "Sahara Desert, Morocco", confidence: 87, time: "1 day ago" },
    { location: "Great Wall, China", confidence: 98, time: "3 days ago" }
  ]

  // Theme variants
  const getThemeClasses = () => {
    if (isCarbonTheme) {
      return {
        gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
        badge: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700",
        button: "bg-green-600 hover:bg-green-700"
      }
    }
    if (isMinimalTheme) {
      return {
        gradient: "bg-slate-900",
        badge: "bg-slate-100 text-slate-700",
        button: "bg-slate-800 hover:bg-slate-900"
      }
    }
    if (isHighContrastTheme) {
      return {
        gradient: "bg-black",
        badge: "bg-yellow-400 text-black font-bold",
        button: "bg-yellow-400 text-black hover:bg-yellow-500"
      }
    }
    // Default gradient theme
    return {
      gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
      badge: "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700"
    }
  }

  const theme = getThemeClasses()

  // CTA Configuration
  const getCTAConfig = () => {
    if (isSingleCTA) {
      return {
        primary: { text: "Detect Location", icon: Target },
        secondary: null
      }
    }
    if (isBrandedCTA) {
      return {
        primary: { text: "Try GeoSpy AI", icon: Sparkles },
        secondary: null
      }
    }
    if (isProfessionalCTA) {
      return {
        primary: { text: "Smart Location Detection", icon: Zap },
        secondary: null
      }
    }
    // Default dual button
    return {
      primary: { text: "Upload Photo", icon: Upload },
      secondary: { text: "Take Photo", icon: Camera }
    }
  }

  const ctaConfig = getCTAConfig()

  const handleCTAClick = (type: 'primary' | 'secondary') => {
    trackCTAClick(type)
    trackWidgetInteraction('navigation_to_geospy', {
      cta_type: type,
      cta_text: type === 'primary' ? ctaConfig.primary.text : ctaConfig.secondary?.text
    })
    router.push('/project/geospy')
  }

  const handleViewAll = () => {
    trackWidgetInteraction('view_all_clicked')
    router.push('/project/geospy')
  }

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${className}`}
      onMouseEnter={() => trackWidgetInteraction('widget_hovered')}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${theme.gradient} p-2 rounded-lg`}>
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">GeoSpy AI</CardTitle>
              <CardDescription>Photo Location Intelligence</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={theme.badge}>
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* A/B Test Indicator (Dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-xs">
              🧪 A/B Test Active: Widget:{widgetPlacement} | CTA:{ctaVariant} | Theme:{visualVariant}
            </AlertDescription>
          </Alert>
        )}

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

        {/* CTA Buttons - Variant Based */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className={`flex-1 ${theme.button}`}
            onClick={() => handleCTAClick('primary')}
          >
            <ctaConfig.primary.icon className="h-4 w-4 mr-2" />
            {ctaConfig.primary.text}
          </Button>
          {ctaConfig.secondary && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleCTAClick('secondary')}
            >
              <ctaConfig.secondary.icon className="h-4 w-4 mr-2" />
              {ctaConfig.secondary.text}
            </Button>
          )}
        </div>

        {/* View All Link */}
        <Button
          variant="ghost"
          className="w-full text-sm"
          onClick={handleViewAll}
        >
          Open Location Intelligence
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Banner variant for A/B testing (Variant B)
 */
export function GeoSpyBannerWidget({ className }: GeoSpyABTestWidgetProps) {
  const router = useRouter()
  const { trackWidgetView, trackCTAClick } = useGeoSpyABTesting()

  useEffect(() => {
    trackWidgetView()
  }, [trackWidgetView])

  const handleCTAClick = () => {
    trackCTAClick('primary')
    router.push('/project/geospy')
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MapPin className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-bold">GeoSpy AI Location Intelligence</h3>
            <p className="text-blue-100">Upload photos to detect coordinates automatically</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleCTAClick}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Try Now
        </Button>
      </div>
    </div>
  )
}

/**
 * Floating variant for A/B testing (Variant D)
 */
export function GeoSpyFloatingWidget({ className }: GeoSpyABTestWidgetProps) {
  const router = useRouter()
  const { trackWidgetView, trackCTAClick } = useGeoSpyABTesting()

  useEffect(() => {
    trackWidgetView()
  }, [trackWidgetView])

  const handleCTAClick = () => {
    trackCTAClick('primary')
    router.push('/project/geospy')
  }

  return (
    <Card className={`absolute top-4 right-4 w-80 shadow-lg border-2 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold">Smart Location Detection</h4>
            <p className="text-sm text-muted-foreground">AI-powered coordinate detection</p>
          </div>
        </div>
        <Button className="w-full" onClick={handleCTAClick}>
          <Sparkles className="h-4 w-4 mr-2" />
          Detect from Photo
        </Button>
      </CardContent>
    </Card>
  )
}

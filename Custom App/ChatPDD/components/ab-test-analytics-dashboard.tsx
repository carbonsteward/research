"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BarChart,
  LineChart,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  Target,
  Download,
  RefreshCw
} from 'lucide-react'

interface ABTestEvent {
  testId: string
  variant: string
  event: string
  properties?: Record<string, any>
  timestamp: string
}

interface TestMetrics {
  testId: string
  testName: string
  variants: {
    [key: string]: {
      name: string
      views: number
      clicks: number
      conversions: number
      conversionRate: number
      users: number
    }
  }
  isActive: boolean
  startDate: string
  endDate?: string
}

export function ABTestAnalyticsDashboard() {
  const [events, setEvents] = useState<ABTestEvent[]>([])
  const [metrics, setMetrics] = useState<TestMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load events from localStorage (in production, this would be from analytics API)
  useEffect(() => {
    loadTestData()
  }, [])

  const loadTestData = () => {
    setIsLoading(true)

    // Load events from localStorage
    const storedEvents = localStorage.getItem('ab-test-events')
    const parsedEvents: ABTestEvent[] = storedEvents ? JSON.parse(storedEvents) : []
    setEvents(parsedEvents)

    // Calculate metrics
    const calculatedMetrics = calculateMetrics(parsedEvents)
    setMetrics(calculatedMetrics)

    setIsLoading(false)
  }

  const calculateMetrics = (events: ABTestEvent[]): TestMetrics[] => {
    const testGroups = events.reduce((acc, event) => {
      if (!acc[event.testId]) {
        acc[event.testId] = {}
      }
      if (!acc[event.testId][event.variant]) {
        acc[event.testId][event.variant] = []
      }
      acc[event.testId][event.variant].push(event)
      return acc
    }, {} as Record<string, Record<string, ABTestEvent[]>>)

    const testConfigs = {
      'geospy-widget-placement': {
        name: 'GeoSpy Widget Placement',
        variants: {
          A: 'Sidebar Top (Current)',
          B: 'Full Width Banner',
          C: 'Integrated in Projects',
          D: 'Floating Main Content'
        }
      },
      'geospy-cta-effectiveness': {
        name: 'GeoSpy CTA Button Text',
        variants: {
          A: 'Current: Upload + Take Photo',
          B: 'Single: Detect Location',
          C: 'Branded: Try GeoSpy AI',
          D: 'Professional: Smart Detection'
        }
      },
      'geospy-visual-design': {
        name: 'GeoSpy Widget Visual Design',
        variants: {
          A: 'Current: Blue-Purple Gradient',
          B: 'Carbon Theme: Green Focus',
          C: 'Minimal: Monochrome',
          D: 'High Contrast: Accessibility'
        }
      }
    }

    return Object.entries(testGroups).map(([testId, variants]) => {
      const config = testConfigs[testId as keyof typeof testConfigs]

      const variantMetrics = Object.entries(variants).reduce((acc, [variant, variantEvents]) => {
        const views = variantEvents.filter(e => e.event === 'widget_viewed').length
        const clicks = variantEvents.filter(e => e.event === 'cta_clicked').length
        const conversions = variantEvents.filter(e => e.event === 'navigation_to_geospy').length
        const users = new Set(variantEvents.map(e => e.timestamp.split('T')[0])).size // Rough user count by day

        acc[variant] = {
          name: config?.variants[variant as keyof typeof config.variants] || `Variant ${variant}`,
          views,
          clicks,
          conversions,
          conversionRate: views > 0 ? (conversions / views) * 100 : 0,
          users
        }
        return acc
      }, {} as TestMetrics['variants'])

      return {
        testId,
        testName: config?.name || testId,
        variants: variantMetrics,
        isActive: true, // In production, check against test config
        startDate: '2025-01-15',
        endDate: '2025-02-15'
      }
    })
  }

  const generateDemoData = () => {
    const demoEvents: ABTestEvent[] = []
    const testIds = ['geospy-widget-placement', 'geospy-cta-effectiveness']
    const variants = ['A', 'B', 'C', 'D']
    const events = ['widget_viewed', 'cta_clicked', 'navigation_to_geospy', 'widget_hovered']

    // Generate 100 demo events
    for (let i = 0; i < 100; i++) {
      const testId = testIds[Math.floor(Math.random() * testIds.length)]
      const variant = variants[Math.floor(Math.random() * variants.length)]
      const event = events[Math.floor(Math.random() * events.length)]

      demoEvents.push({
        testId,
        variant,
        event,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    localStorage.setItem('ab-test-events', JSON.stringify(demoEvents))
    loadTestData()
  }

  const clearData = () => {
    localStorage.removeItem('ab-test-events')
    setEvents([])
    setMetrics([])
  }

  const exportData = () => {
    const dataStr = JSON.stringify({ events, metrics }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ab-test-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getWinningVariant = (testMetrics: TestMetrics) => {
    const variants = Object.entries(testMetrics.variants)
    const sortedByConversion = variants.sort((a, b) => b[1].conversionRate - a[1].conversionRate)
    return sortedByConversion[0]
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-48 rounded-lg" />
        <div className="animate-pulse bg-muted h-48 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing Analytics</h2>
          <p className="text-muted-foreground">Monitor GeoSpy widget performance across variants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTestData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={generateDemoData}>
            Generate Demo Data
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={clearData}>
            Clear Data
          </Button>
        </div>
      </div>

      {events.length === 0 && (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertTitle>No Test Data Available</AlertTitle>
          <AlertDescription>
            Start interacting with the GeoSpy widget or generate demo data to see analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">All A/B test interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Widget Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.event === 'widget_viewed').length}
            </div>
            <p className="text-xs text-muted-foreground">Total impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.event === 'cta_clicked').length}
            </div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Tabs defaultValue="placement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="placement">Widget Placement</TabsTrigger>
          <TabsTrigger value="cta">CTA Effectiveness</TabsTrigger>
          <TabsTrigger value="visual">Visual Design</TabsTrigger>
          <TabsTrigger value="events">Raw Events</TabsTrigger>
        </TabsList>

        {metrics.map((testMetrics) => (
          <TabsContent
            key={testMetrics.testId}
            value={testMetrics.testId.split('-')[1]} // extract 'placement', 'cta', etc.
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{testMetrics.testName}</CardTitle>
                    <CardDescription>
                      Running from {testMetrics.startDate} to {testMetrics.endDate}
                    </CardDescription>
                  </div>
                  <Badge variant={testMetrics.isActive ? "default" : "secondary"}>
                    {testMetrics.isActive ? "Active" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Winning Variant Alert */}
                  {Object.keys(testMetrics.variants).length > 0 && (
                    <Alert className="border-green-200 bg-green-50">
                      <TrendingUp className="h-4 w-4" />
                      <AlertTitle>Current Leading Variant</AlertTitle>
                      <AlertDescription>
                        <strong>Variant {getWinningVariant(testMetrics)[0]}:</strong> {getWinningVariant(testMetrics)[1].name}
                        <span className="ml-2">
                          ({getWinningVariant(testMetrics)[1].conversionRate.toFixed(1)}% conversion rate)
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Variants Comparison */}
                  <div className="grid gap-4">
                    {Object.entries(testMetrics.variants).map(([variant, data]) => (
                      <div key={variant} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Variant {variant}</Badge>
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <Badge
                            variant={variant === getWinningVariant(testMetrics)[0] ? "default" : "secondary"}
                          >
                            {data.conversionRate.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Views</div>
                            <div className="font-medium">{data.views}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Clicks</div>
                            <div className="font-medium">{data.clicks}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Conversions</div>
                            <div className="font-medium">{data.conversions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Users</div>
                            <div className="font-medium">{data.users}</div>
                          </div>
                        </div>

                        {/* Progress bar for conversion rate */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Conversion Rate</span>
                            <span>{data.conversionRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Event Stream</CardTitle>
              <CardDescription>All A/B testing events in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.slice(-50).reverse().map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {event.variant}
                      </Badge>
                      <span className="font-medium">{event.event}</span>
                      <span className="text-muted-foreground">{event.testId}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No events recorded yet. Interact with the GeoSpy widget to generate data.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Globe,
  Leaf,
  FileCheck,
  Users,
  Clock,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Zap
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"

// Real-time data generator
function generateTimeSeriesData() {
  const now = new Date()
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toISOString().split('T')[0],
      carbonStandards: Math.floor(85 + Math.random() * 10 + i * 0.2),
      methodologies: Math.floor(47 + Math.random() * 5 + i * 0.1),
      icroaApproved: Math.floor(65 + Math.random() * 5 + i * 0.1),
      corsiaApproved: Math.floor(40 + Math.random() * 5 + i * 0.1)
    })
  }
  return data
}

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  color: string
  trend: number[]
  suffix?: string
  isLive?: boolean
}

function StatCard({ title, value, change, icon: Icon, color, trend, suffix = "", isLive = false }: StatCardProps) {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const variation = Math.random() * 0.02 - 0.01 // ±1% variation
        const newValue = typeof value === 'number' ?
          Math.max(0, value + (value * variation)) :
          parseInt(value.toString()) + Math.floor(Math.random() * 3)
        setCurrentValue(newValue)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [value, isLive])

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden group cursor-pointer">
        <CardContent className="p-6">
          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-emerald-600 font-medium">LIVE</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
              <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>

            {/* Mini trend chart */}
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.map((val, i) => ({ value: val, index: i }))}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color.replace('bg-', '#').replace('-500', '')}
                    fill={color.replace('bg-', '#').replace('-500', '')}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>

            <div className="flex items-baseline gap-2">
              <motion.span
                key={currentValue}
                initial={{ scale: 1.2, color: '#10b981' }}
                animate={{ scale: 1, color: '#111827' }}
                className="text-3xl font-bold text-gray-900"
              >
                {formatValue(currentValue)}{suffix}
              </motion.span>

              {change !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  change > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {change > 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </div>

            {/* Progress bar for visual impact */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full ${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (typeof currentValue === 'number' ? currentValue : parseInt(currentValue.toString())) / 20)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function EnhancedStatsDashboard() {
  const [timeSeriesData] = useState(generateTimeSeriesData())
  const [activeMetric, setActiveMetric] = useState('carbonStandards')
  const [isRealTime, setIsRealTime] = useState(true)

  // Generate trend data for each stat
  const trendData = {
    carbonStandards: Array.from({length: 10}, (_, i) => 85 + i * 0.5 + Math.random() * 2),
    methodologies: Array.from({length: 10}, (_, i) => 47 + i * 0.2 + Math.random() * 2),
    icroaApproved: Array.from({length: 10}, (_, i) => 65 + i * 0.2 + Math.random() * 1),
    corsiaApproved: Array.from({length: 10}, (_, i) => 40 + i * 0.2 + Math.random() * 1)
  }

  const stats = [
    {
      title: "Carbon Standards",
      value: 90,
      change: 8.3,
      icon: FileCheck,
      color: "bg-blue-500",
      trend: trendData.carbonStandards,
      suffix: "+",
      isLive: true
    },
    {
      title: "Methodologies",
      value: 47,
      change: 12.5,
      icon: TrendingUp,
      color: "bg-emerald-500",
      trend: trendData.methodologies,
      suffix: "",
      isLive: true
    },
    {
      title: "ICROA Approved",
      value: 67,
      change: 5.2,
      icon: Badge,
      color: "bg-green-500",
      trend: trendData.icroaApproved,
      suffix: "",
      isLive: true
    },
    {
      title: "CORSIA Approved",
      value: 42,
      change: 3.1,
      icon: Globe,
      color: "bg-purple-500",
      trend: trendData.corsiaApproved,
      suffix: "",
      isLive: false
    }
  ]

  const metricLabels: Record<string, string> = {
    carbonStandards: "Carbon Standards",
    methodologies: "Methodologies",
    icroaApproved: "ICROA Approved",
    corsiaApproved: "CORSIA Approved"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h2>
          <p className="text-gray-600">Real-time insights into global carbon project development</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isRealTime ? "default" : "outline"}
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {isRealTime ? "Live Data" : "Static View"}
          </Button>

          {isRealTime && (
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              <Zap className="h-3 w-3 mr-1" />
              Auto-updating
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            isLive={isRealTime && stat.isLive}
          />
        ))}
      </div>

      {/* Interactive Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Trends: {metricLabels[activeMetric]}
              </h3>
              <p className="text-gray-600">30-day historical data</p>
            </div>

            {/* Metric selector */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(metricLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={activeMetric === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMetric(key)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Peak Activity",
            value: "2:00 PM UTC",
            description: "Highest project creation time",
            icon: Clock,
            color: "text-blue-600"
          },
          {
            title: "Top Region",
            value: "South America",
            description: "47% of new AFOLU projects",
            icon: Globe,
            color: "text-emerald-600"
          },
          {
            title: "Success Rate",
            value: "85.0%",
            description: "Projects reaching validation",
            icon: BarChart3,
            color: "text-purple-600"
          }
        ].map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <insight.icon className={`h-8 w-8 ${insight.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{insight.title}</div>
                <div className="text-xs text-gray-500">{insight.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

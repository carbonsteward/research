"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon, ArrowUpIcon, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface AnalyticsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
    label: string
  }
  chartData?: Array<{ name: string; value: number }>
  chartColor?: string
  additionalInfo?: string
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  change,
  chartData = [],
  chartColor = "hsl(var(--chart-1))",
  additionalInfo,
  actions = []
}: AnalyticsCardProps) {
  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return "text-green-500"
    if (trend === "down") return "text-red-500"
    return "text-muted-foreground"
  }

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return <ArrowUpIcon className="h-4 w-4" />
    if (trend === "down") return <ArrowDownIcon className="h-4 w-4" />
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {actions.map((action, index) => (
                <DropdownMenuItem key={index} onClick={action.onClick}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className={`flex items-center space-x-1 ${getTrendColor(change.trend)}`}>
                {getTrendIcon(change.trend)}
                <span className="text-sm font-medium">{change.value}%</span>
                <span className="text-xs text-muted-foreground">{change.label}</span>
              </div>
            )}
          </div>

          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          {chartData.length > 0 && (
            <Tabs defaultValue="area" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
              <TabsContent value="area" className="h-[150px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.substring(0, 3)}
                      className="text-xs"
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      className="text-xs"
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill={`url(#color-${title})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="bar" className="h-[150px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.substring(0, 3)}
                      className="text-xs"
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      className="text-xs"
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          )}

          {additionalInfo && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs font-normal">
                {additionalInfo}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

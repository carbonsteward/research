"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DataPoint {
  label: string
  value: number
  color?: string
  percentage?: number
}

interface CarbonChartProps {
  data: DataPoint[]
  title?: string
  subtitle?: string
  type?: 'bar' | 'donut' | 'line'
  height?: number
  showValues?: boolean
  showPercentages?: boolean
  className?: string
  children?: ReactNode
}

export function CarbonChart({
  data,
  title,
  subtitle,
  type = 'bar',
  height = 200,
  showValues = true,
  showPercentages = false,
  className,
  children
}: CarbonChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ]

  const renderBarChart = () => (
    <div className="space-y-4" style={{ height }}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        const color = item.color || colors[index % colors.length]
        
        return (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              {showValues && (
                <span className="font-semibold text-slate-900">
                  {item.value.toLocaleString()}
                  {showPercentages && item.percentage && ` (${item.percentage}%)`}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full soft-transition"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0
    const centerX = 80
    const centerY = 80
    const radius = 70

    return (
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <svg width="160" height="160" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (item.value / total) * 360
              const color = item.color || colors[index % colors.length]
              
              const startAngle = currentAngle
              const endAngle = currentAngle + angle
              currentAngle += angle

              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <path
                  key={item.label}
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={color}
                  className="hover:opacity-80 soft-transition"
                />
              )
            })}
            {/* Center circle for donut effect */}
            <circle
              cx={centerX}
              cy={centerY}
              r={35}
              fill="white"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 flex-1">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            const color = item.color || colors[index % colors.length]
            
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.value.toLocaleString()} ({percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'rounded-xl border border-slate-200/60 bg-white p-6 scientific-shadow-lg',
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {type === 'bar' && renderBarChart()}
      {type === 'donut' && renderDonutChart()}
      
      {children && (
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          {children}
        </div>
      )}
    </div>
  )
}
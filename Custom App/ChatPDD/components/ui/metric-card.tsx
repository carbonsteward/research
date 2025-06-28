"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: LucideIcon
  iconColor?: string
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'carbon'
  className?: string
  children?: ReactNode
}

const variantStyles = {
  default: 'bg-gradient-to-br from-white to-slate-50/30 border-slate-200/60',
  accent: 'bg-gradient-to-br from-pink-50 to-pink-100/30 border-pink-200/60',
  success: 'bg-gradient-to-br from-green-50 to-green-100/30 border-green-200/60',
  warning: 'bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/60',
  carbon: 'bg-gradient-to-br from-emerald-50 to-teal-100/30 border-emerald-200/60'
}

const iconColors = {
  default: 'text-slate-600',
  accent: 'text-pink-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  carbon: 'text-emerald-600'
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor,
  variant = 'default',
  className,
  children
}: MetricCardProps) {
  const trendColor = trend?.direction === 'up' 
    ? 'text-green-600' 
    : trend?.direction === 'down' 
    ? 'text-red-600' 
    : 'text-slate-600'

  const trendIcon = trend?.direction === 'up' 
    ? '↗' 
    : trend?.direction === 'down' 
    ? '↘' 
    : '→'

  return (
    <div className={cn(
      'rounded-xl border scientific-shadow-lg hover-lift p-6',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <Icon className={cn(
                'h-5 w-5',
                iconColor || iconColors[variant]
              )} />
            )}
            <p className="text-sm font-medium text-slate-600 tracking-wide">
              {title}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {subtitle && (
              <p className="text-sm text-slate-500 leading-relaxed">
                {subtitle}
              </p>
            )}
            
            {trend && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
                <span className="text-lg leading-none">{trendIcon}</span>
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                <span className="text-slate-500 font-normal">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {children && (
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          {children}
        </div>
      )}
    </div>
  )
}
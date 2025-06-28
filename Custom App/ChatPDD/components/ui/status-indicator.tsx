"use client"

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { CheckCircle, Clock, AlertTriangle, XCircle, Zap } from 'lucide-react'

type StatusType = 'completed' | 'in_progress' | 'pending' | 'warning' | 'error' | 'active'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'badge'
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<StatusType, {
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}> = {
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  in_progress: {
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  pending: {
    icon: Clock,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  active: {
    icon: Zap,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800'
  }
}

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1'
  },
  md: {
    icon: 'h-4 w-4',
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    gap: 'gap-2'
  },
  lg: {
    icon: 'h-5 w-5',
    text: 'text-base',
    padding: 'px-4 py-2',
    gap: 'gap-2'
  }
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const sizeStyle = sizeConfig[size]
  const Icon = config.icon

  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-lg soft-transition',
    sizeStyle.gap,
    sizeStyle.text,
    className
  )

  if (variant === 'minimal') {
    return (
      <div className={cn(baseClasses, config.textColor)}>
        {showIcon && <Icon className={cn(sizeStyle.icon, config.color)} />}
        {label && <span>{label}</span>}
      </div>
    )
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        baseClasses,
        sizeStyle.padding,
        config.bgColor,
        config.borderColor,
        config.textColor,
        'border'
      )}>
        {showIcon && <Icon className={sizeStyle.icon} />}
        {label && <span>{label}</span>}
      </div>
    )
  }

  // Default variant with pulse animation for active states
  return (
    <div className={cn(
      baseClasses,
      sizeStyle.padding,
      config.bgColor,
      config.borderColor,
      config.textColor,
      'border scientific-shadow',
      (status === 'in_progress' || status === 'active') && 'animate-pulse'
    )}>
      {showIcon && <Icon className={sizeStyle.icon} />}
      {label && <span>{label}</span>}
    </div>
  )
}

// Preset status indicators for common use cases
export const ProjectStatus = ({ status, ...props }: Omit<StatusIndicatorProps, 'status'> & { status: 'development' | 'validation' | 'registered' | 'implementation' | 'monitoring' | 'completed' }) => {
  const statusMap: Record<typeof status, StatusType> = {
    development: 'pending',
    validation: 'in_progress',
    registered: 'active',
    implementation: 'in_progress',
    monitoring: 'active',
    completed: 'completed'
  }
  
  return <StatusIndicator status={statusMap[status]} label={status} {...props} />
}

export const RiskLevel = ({ level, ...props }: Omit<StatusIndicatorProps, 'status' | 'label'> & { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) => {
  const statusMap: Record<typeof level, StatusType> = {
    LOW: 'completed',
    MEDIUM: 'warning',
    HIGH: 'warning',
    CRITICAL: 'error'
  }
  
  return <StatusIndicator status={statusMap[level]} label={`${level} Risk`} {...props} />
}
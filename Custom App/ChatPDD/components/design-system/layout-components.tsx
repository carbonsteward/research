// ChatPDD Design System - Layout Components
// Consistent spacing, typography, and layout components

import React from 'react'
import { cn } from '@/lib/utils'

// ================================
// CONTAINER COMPONENTS
// ================================

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'narrow' | 'wide'
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  const sizeClasses = {
    default: 'max-w-[1200px]',
    narrow: 'max-w-[768px]',
    wide: 'max-w-[1400px]'
  }

  return (
    <div className={cn(
      'container mx-auto px-6',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

// ================================
// SECTION COMPONENTS
// ================================

interface SectionProps {
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
  background?: 'default' | 'secondary' | 'accent'
}

export function Section({ children, className, spacing = 'md', background = 'default' }: SectionProps) {
  const spacingClasses = {
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-20 md:py-32'
  }

  const backgroundClasses = {
    default: 'bg-white',
    secondary: 'bg-gray-50',
    accent: 'bg-primary-50'
  }

  return (
    <section className={cn(
      'w-full',
      spacingClasses[spacing],
      backgroundClasses[background],
      className
    )}>
      {children}
    </section>
  )
}

// ================================
// TYPOGRAPHY COMPONENTS
// ================================

interface HeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  variant?: 'hero' | 'section' | 'subsection' | 'card'
}

export function Heading({ children, level, className, variant }: HeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements

  // Auto-detect variant based on level if not provided
  const getVariant = () => {
    if (variant) return variant
    if (level === 1) return 'hero'
    if (level === 2) return 'section'
    if (level === 3) return 'subsection'
    return 'card'
  }

  const variantClasses = {
    hero: 'text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900',
    section: 'text-2xl md:text-3xl font-bold tracking-tight text-gray-900',
    subsection: 'text-xl md:text-2xl font-semibold text-gray-900',
    card: 'text-lg md:text-xl font-semibold text-gray-900'
  }

  return (
    <Component className={cn(
      variantClasses[getVariant()],
      className
    )}>
      {children}
    </Component>
  )
}

interface TextProps {
  children: React.ReactNode
  variant?: 'body-large' | 'body' | 'body-small' | 'caption'
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled'
  className?: string
  as?: 'p' | 'span' | 'div'
}

export function Text({
  children,
  variant = 'body',
  color = 'secondary',
  className,
  as: Component = 'p'
}: TextProps) {
  const variantClasses = {
    'body-large': 'text-lg leading-relaxed',
    'body': 'text-base leading-normal',
    'body-small': 'text-sm leading-normal',
    'caption': 'text-xs font-medium leading-normal'
  }

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    disabled: 'text-gray-400'
  }

  return (
    <Component className={cn(
      variantClasses[variant],
      colorClasses[color],
      className
    )}>
      {children}
    </Component>
  )
}

// ================================
// CARD COMPONENTS
// ================================

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'spacious'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  clickable = false,
  onClick
}: CardProps) {
  const variantClasses = {
    default: 'p-6 rounded-lg',
    compact: 'p-4 rounded-md',
    spacious: 'p-8 rounded-xl'
  }

  const interactionClasses = cn(
    hover && 'hover:shadow-md transition-shadow duration-200',
    clickable && 'cursor-pointer hover:scale-[1.02] transition-transform duration-200',
    onClick && 'cursor-pointer'
  )

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 shadow-sm',
        variantClasses[variant],
        interactionClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ================================
// GRID COMPONENTS
// ================================

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
  responsive?: boolean
}

export function Grid({ children, cols = 3, gap = 'md', className, responsive = true }: GridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  const colClasses = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }

  return (
    <div className={cn(
      'grid',
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// ================================
// SPACING COMPONENTS
// ================================

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  axis?: 'vertical' | 'horizontal' | 'both'
}

export function Spacer({ size = 'md', axis = 'vertical' }: SpacerProps) {
  const sizeClasses = {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px'
  }

  const style = {
    vertical: { height: sizeClasses[size] },
    horizontal: { width: sizeClasses[size] },
    both: { height: sizeClasses[size], width: sizeClasses[size] }
  }

  return <div style={style[axis]} />
}

// ================================
// LAYOUT UTILITIES
// ================================

interface StackProps {
  children: React.ReactNode
  direction?: 'row' | 'column'
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
}

export function Stack({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  className
}: StackProps) {
  const spacingClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  const directionClass = direction === 'row' ? 'flex' : 'flex flex-col'

  return (
    <div className={cn(
      directionClass,
      spacingClasses[spacing],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  )
}

// ================================
// FEATURE CARD COMPONENT
// ================================

interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function FeatureCard({ title, description, icon, className, onClick }: FeatureCardProps) {
  return (
    <Card
      hover
      clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <Stack spacing="md">
        {icon && (
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              {icon}
            </div>
          </div>
        )}

        <div>
          <Heading level={3} variant="card" className="mb-2">
            {title}
          </Heading>
          <Text variant="body" className="leading-relaxed">
            {description}
          </Text>
        </div>
      </Stack>
    </Card>
  )
}

// ================================
// HERO SECTION COMPONENT
// ================================

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  children?: React.ReactNode
  background?: 'default' | 'gradient'
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  children,
  background = 'default',
  className
}: HeroSectionProps) {
  const backgroundClasses = {
    default: 'bg-white',
    gradient: 'bg-gradient-to-br from-primary-50 via-white to-blue-50'
  }

  return (
    <Section
      spacing="lg"
      className={cn(backgroundClasses[background], className)}
    >
      <Container size="narrow">
        <div className="text-center">
          <Stack spacing="lg">
            <div>
              {subtitle && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                    {subtitle}
                  </span>
                </div>
              )}

              <Heading level={1} variant="hero" className="mb-6">
                {title}
              </Heading>

              {description && (
                <Text variant="body-large" className="max-w-3xl mx-auto">
                  {description}
                </Text>
              )}
            </div>

            {children && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {children}
              </div>
            )}
          </Stack>
        </div>
      </Container>
    </Section>
  )
}

// ================================
// SECTION WITH HEADER COMPONENT
// ================================

interface SectionWithHeaderProps {
  title: string
  subtitle?: string
  description?: string
  children: React.ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
  background?: 'default' | 'secondary' | 'accent'
}

export function SectionWithHeader({
  title,
  subtitle,
  description,
  children,
  className,
  spacing = 'md',
  background = 'default'
}: SectionWithHeaderProps) {
  return (
    <Section spacing={spacing} background={background} className={className}>
      <Container>
        <div className="text-center mb-12 lg:mb-16">
          <Stack spacing="md">
            {subtitle && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                {subtitle}
              </span>
            )}

            <Heading level={2} variant="section">
              {title}
            </Heading>

            {description && (
              <Text variant="body-large" className="max-w-3xl mx-auto">
                {description}
              </Text>
            )}
          </Stack>
        </div>

        {children}
      </Container>
    </Section>
  )
}

export default {
  Container,
  Section,
  Heading,
  Text,
  Card,
  Grid,
  Spacer,
  Stack,
  FeatureCard,
  HeroSection,
  SectionWithHeader
}

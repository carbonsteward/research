"use client"

import { useState, useEffect } from 'react'
import { getUserTestVariant, trackTestEvent, getUserActiveTests, type TestVariant } from '@/lib/ab-testing'

/**
 * Hook for A/B testing functionality
 * Provides variant assignment and event tracking
 */
export function useABTesting(userId?: string) {
  const [testAssignments, setTestAssignments] = useState<Record<string, TestVariant>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Generate a session-based user ID if none provided
  const effectiveUserId = userId || getSessionUserId()

  useEffect(() => {
    if (effectiveUserId) {
      const assignments = getUserActiveTests(effectiveUserId)
      setTestAssignments(assignments)
      setIsLoading(false)
    }
  }, [effectiveUserId])

  /**
   * Get variant for a specific test
   */
  const getVariant = (testId: string): TestVariant | null => {
    return testAssignments[testId] || null
  }

  /**
   * Check if user is in specific variant
   */
  const isVariant = (testId: string, variant: TestVariant): boolean => {
    return testAssignments[testId] === variant
  }

  /**
   * Track an event for A/B testing
   */
  const track = (testId: string, event: string, properties?: Record<string, any>) => {
    const variant = testAssignments[testId]
    if (variant) {
      trackTestEvent(testId, variant, event, properties)
    }
  }

  return {
    getVariant,
    isVariant,
    track,
    testAssignments,
    isLoading,
    userId: effectiveUserId
  }
}

/**
 * Hook specifically for GeoSpy widget A/B testing
 */
export function useGeoSpyABTesting() {
  const { getVariant, isVariant, track, isLoading } = useABTesting()

  // Widget placement variants
  const widgetPlacement = getVariant('geospy-widget-placement')
  const ctaVariant = getVariant('geospy-cta-effectiveness')
  const visualVariant = getVariant('geospy-visual-design')

  // Helper functions for specific tests
  const trackWidgetView = () => {
    track('geospy-widget-placement', 'widget_viewed')
    track('geospy-cta-effectiveness', 'widget_viewed')
    if (visualVariant) {
      track('geospy-visual-design', 'widget_viewed')
    }
  }

  const trackCTAClick = (ctaType: 'primary' | 'secondary') => {
    track('geospy-cta-effectiveness', 'cta_clicked', { ctaType })
    track('geospy-widget-placement', 'cta_clicked', { ctaType })
  }

  const trackWidgetInteraction = (interaction: string, properties?: Record<string, any>) => {
    track('geospy-widget-placement', interaction, properties)
    track('geospy-cta-effectiveness', interaction, properties)
  }

  return {
    // Placement variants
    isWidgetInSidebar: isVariant('geospy-widget-placement', 'A'),
    isWidgetBanner: isVariant('geospy-widget-placement', 'B'),
    isWidgetInline: isVariant('geospy-widget-placement', 'C'),
    isWidgetFloating: isVariant('geospy-widget-placement', 'D'),

    // CTA variants
    isDualButton: isVariant('geospy-cta-effectiveness', 'A'),
    isSingleCTA: isVariant('geospy-cta-effectiveness', 'B'),
    isBrandedCTA: isVariant('geospy-cta-effectiveness', 'C'),
    isProfessionalCTA: isVariant('geospy-cta-effectiveness', 'D'),

    // Visual variants
    isGradientTheme: isVariant('geospy-visual-design', 'A'),
    isCarbonTheme: isVariant('geospy-visual-design', 'B'),
    isMinimalTheme: isVariant('geospy-visual-design', 'C'),
    isHighContrastTheme: isVariant('geospy-visual-design', 'D'),

    // Get raw variants
    widgetPlacement,
    ctaVariant,
    visualVariant,

    // Tracking functions
    trackWidgetView,
    trackCTAClick,
    trackWidgetInteraction,

    isLoading
  }
}

/**
 * Generate or retrieve session-based user ID
 */
function getSessionUserId(): string {
  if (typeof window === 'undefined') return 'server'

  let userId = localStorage.getItem('ab-test-user-id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('ab-test-user-id', userId)
  }
  return userId
}

/**
 * A/B Testing Framework for ChatPDD
 * Handles feature flag management and user segmentation
 */

export type TestVariant = 'A' | 'B' | 'C' | 'D'

export interface ABTest {
  id: string
  name: string
  description: string
  variants: {
    [key in TestVariant]?: {
      name: string
      weight: number // Percentage of users (0-100)
      config: Record<string, any>
    }
  }
  isActive: boolean
  startDate: Date
  endDate?: Date
}

export interface UserTestAssignment {
  userId: string
  testId: string
  variant: TestVariant
  assignedAt: Date
}

// Test configurations
export const abTests: Record<string, ABTest> = {
  'geospy-widget-placement': {
    id: 'geospy-widget-placement',
    name: 'GeoSpy Widget Placement',
    description: 'Test optimal placement of GeoSpy AI widget in dashboard',
    variants: {
      A: {
        name: 'Sidebar Top (Current)',
        weight: 25,
        config: { placement: 'sidebar-top' }
      },
      B: {
        name: 'Full Width Banner',
        weight: 25,
        config: { placement: 'banner-top' }
      },
      C: {
        name: 'Integrated in Projects',
        weight: 25,
        config: { placement: 'project-inline' }
      },
      D: {
        name: 'Floating Main Content',
        weight: 25,
        config: { placement: 'floating-main' }
      }
    },
    isActive: true,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-15')
  },

  'geospy-cta-effectiveness': {
    id: 'geospy-cta-effectiveness',
    name: 'GeoSpy CTA Button Text',
    description: 'Test effectiveness of different call-to-action buttons',
    variants: {
      A: {
        name: 'Current: Upload + Take Photo',
        weight: 25,
        config: {
          primaryCTA: 'Upload Photo',
          secondaryCTA: 'Take Photo',
          style: 'dual-button'
        }
      },
      B: {
        name: 'Single: Detect Location',
        weight: 25,
        config: {
          primaryCTA: 'Detect Location',
          style: 'single-primary'
        }
      },
      C: {
        name: 'Branded: Try GeoSpy AI',
        weight: 25,
        config: {
          primaryCTA: 'Try GeoSpy AI',
          icon: 'sparkles',
          style: 'branded'
        }
      },
      D: {
        name: 'Professional: Smart Detection',
        weight: 25,
        config: {
          primaryCTA: 'Smart Location Detection',
          style: 'professional'
        }
      }
    },
    isActive: true,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-15')
  },

  'geospy-visual-design': {
    id: 'geospy-visual-design',
    name: 'GeoSpy Widget Visual Design',
    description: 'Test different visual approaches for the widget',
    variants: {
      A: {
        name: 'Current: Blue-Purple Gradient',
        weight: 25,
        config: { theme: 'gradient-blue-purple' }
      },
      B: {
        name: 'Carbon Theme: Green Focus',
        weight: 25,
        config: { theme: 'carbon-green' }
      },
      C: {
        name: 'Minimal: Monochrome',
        weight: 25,
        config: { theme: 'minimal-mono' }
      },
      D: {
        name: 'High Contrast: Accessibility',
        weight: 25,
        config: { theme: 'high-contrast' }
      }
    },
    isActive: false, // Will activate after placement test
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-03-01')
  }
}

/**
 * Get user's test variant assignment
 * Uses deterministic hashing for consistent assignment
 */
export function getUserTestVariant(
  userId: string,
  testId: string
): TestVariant | null {
  const test = abTests[testId]
  if (!test || !test.isActive) return null

  // Simple hash function for user assignment
  const hash = hashString(`${userId}-${testId}`)
  const percentage = hash % 100

  let cumulative = 0
  for (const [variant, config] of Object.entries(test.variants)) {
    cumulative += config.weight
    if (percentage < cumulative) {
      return variant as TestVariant
    }
  }

  return 'A' // Default fallback
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Track test assignment and user actions
 */
export function trackTestEvent(
  testId: string,
  variant: TestVariant,
  event: string,
  properties?: Record<string, any>
) {
  // In production, this would send to analytics service
  console.log('AB Test Event:', {
    testId,
    variant,
    event,
    properties,
    timestamp: new Date().toISOString()
  })

  // Store in localStorage for development
  if (typeof window !== 'undefined') {
    const events = JSON.parse(
      localStorage.getItem('ab-test-events') || '[]'
    )
    events.push({
      testId,
      variant,
      event,
      properties,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('ab-test-events', JSON.stringify(events))
  }
}

/**
 * Check if user is in a specific test variant
 */
export function isInTestVariant(
  userId: string,
  testId: string,
  variant: TestVariant
): boolean {
  return getUserTestVariant(userId, testId) === variant
}

/**
 * Get all active tests for a user
 */
export function getUserActiveTests(userId: string): Record<string, TestVariant> {
  const assignments: Record<string, TestVariant> = {}

  for (const [testId, test] of Object.entries(abTests)) {
    if (test.isActive) {
      const variant = getUserTestVariant(userId, testId)
      if (variant) {
        assignments[testId] = variant
      }
    }
  }

  return assignments
}

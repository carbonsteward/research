import { useState, useEffect, useCallback } from 'react'

export interface CarbonStandard {
  id: string
  name: string
  abbreviation?: string
  introducingEntity?: string
  organizationType?: string
  geographicScope?: string
  focusSector?: string
  description?: string
  websiteUrl?: string
  icroaApproved: boolean
  corsiaApproved: boolean
  correspondingAdjustmentLabel?: string
  totalMethodologies: number
  lastUpdated: string
  createdAt: string
  _count?: {
    methodologies: number
    pddRequirements: number
    certificationProcess: number
  }
}

export interface StandardSearchParams {
  query?: string
  organizationType?: string
  geographicScope?: string
  focusSector?: string
  icroaApproved?: boolean
  corsiaApproved?: boolean
  includeStats?: boolean
}

export function useStandards(params: StandardSearchParams = {}) {
  const [data, setData] = useState<CarbonStandard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStandards = useCallback(async (searchParams: StandardSearchParams) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()

      if (searchParams.query) queryParams.append('query', searchParams.query)
      if (searchParams.organizationType) queryParams.append('organizationType', searchParams.organizationType)
      if (searchParams.geographicScope) queryParams.append('geographicScope', searchParams.geographicScope)
      if (searchParams.focusSector) queryParams.append('focusSector', searchParams.focusSector)
      if (searchParams.icroaApproved !== undefined) {
        queryParams.append('icroaApproved', searchParams.icroaApproved.toString())
      }
      if (searchParams.corsiaApproved !== undefined) {
        queryParams.append('corsiaApproved', searchParams.corsiaApproved.toString())
      }
      if (searchParams.includeStats !== undefined) {
        queryParams.append('includeStats', searchParams.includeStats.toString())
      }

      const response = await fetch(`/api/standards?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch standards: ${response.statusText}`)
      }

      const result: { success: boolean; data: CarbonStandard[] } = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch carbon standards')
      }

      setData(result.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStandards(params)
  }, [params, fetchStandards])

  const refresh = useCallback(() => {
    fetchStandards(params)
  }, [params, fetchStandards])

  return {
    data,
    loading,
    error,
    refresh,
  }
}

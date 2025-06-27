import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './use-debounce'

export interface Methodology {
  id: string
  name: string
  type?: string
  category?: string
  link?: string
  itmoAcceptance: boolean
  description?: string
  lastUpdated: string
  createdAt: string
  standard: {
    id: string
    name: string
    abbreviation?: string
    organizationType?: string
    geographicScope?: string
  }
  _count: {
    pddRequirements: number
    projects: number
  }
}

export interface MethodologySearchParams {
  query?: string
  standardId?: string
  category?: string
  type?: string
  itmoAcceptance?: boolean
  limit?: number
  offset?: number
}

export interface MethodologySearchResult {
  data: Methodology[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    nextOffset: number | null
  }
}

export function useMethodologies(params: MethodologySearchParams = {}) {
  const [data, setData] = useState<Methodology[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
    nextOffset: null as number | null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(params.query || '', 300)

  const fetchMethodologies = useCallback(async (searchParams: MethodologySearchParams, reset = true) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()

      if (searchParams.query) queryParams.append('query', searchParams.query)
      if (searchParams.standardId) queryParams.append('standardId', searchParams.standardId)
      if (searchParams.category) queryParams.append('category', searchParams.category)
      if (searchParams.type) queryParams.append('type', searchParams.type)
      if (searchParams.itmoAcceptance !== undefined) {
        queryParams.append('itmoAcceptance', searchParams.itmoAcceptance.toString())
      }
      if (searchParams.limit) queryParams.append('limit', searchParams.limit.toString())
      if (searchParams.offset) queryParams.append('offset', searchParams.offset.toString())

      const response = await fetch(`/api/methodologies?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch methodologies: ${response.statusText}`)
      }

      const result: { success: boolean; data: Methodology[]; pagination: any } = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch methodologies')
      }

      if (reset) {
        setData(result.data)
      } else {
        // Append for pagination (load more)
        setData(prev => [...prev, ...result.data])
      }

      setPagination(result.pagination)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (reset) {
        setData([])
        setPagination({
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false,
          nextOffset: null,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect to trigger search when parameters change
  useEffect(() => {
    const searchParams = {
      ...params,
      query: debouncedQuery || params.query,
      offset: 0, // Reset to first page when search params change
    }

    fetchMethodologies(searchParams, true)
  }, [
    debouncedQuery,
    params.standardId,
    params.category,
    params.type,
    params.itmoAcceptance,
    params.limit,
    fetchMethodologies,
  ])

  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore && pagination.nextOffset !== null) {
      const searchParams = {
        ...params,
        query: debouncedQuery || params.query,
        offset: pagination.nextOffset,
      }
      fetchMethodologies(searchParams, false)
    }
  }, [loading, pagination, params, debouncedQuery, fetchMethodologies])

  const refresh = useCallback(() => {
    const searchParams = {
      ...params,
      query: debouncedQuery || params.query,
      offset: 0,
    }
    fetchMethodologies(searchParams, true)
  }, [params, debouncedQuery, fetchMethodologies])

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
  }
}

export interface MethodologyRecommendationParams {
  projectType: 'AFOLU' | 'ENERGY' | 'TRANSPORT' | 'MANUFACTURING' | 'WASTE' | 'BUILDINGS' | 'OTHER'
  country: string
  region?: string
  itmoRequired?: boolean
}

export interface MethodologyRecommendation extends Methodology {
  recommendationScore: number
  reasons: string[]
}

export function useMethodologyRecommendations(params?: MethodologyRecommendationParams) {
  const [data, setData] = useState<MethodologyRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async (searchParams: MethodologyRecommendationParams) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        projectType: searchParams.projectType,
        country: searchParams.country,
      })

      if (searchParams.region) queryParams.append('region', searchParams.region)
      if (searchParams.itmoRequired !== undefined) {
        queryParams.append('itmoRequired', searchParams.itmoRequired.toString())
      }

      const response = await fetch(`/api/methodologies/recommendations?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
      }

      const result: { success: boolean; data: MethodologyRecommendation[] } = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch methodology recommendations')
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
    if (params) {
      fetchRecommendations(params)
    }
  }, [params, fetchRecommendations])

  const refresh = useCallback(() => {
    if (params) {
      fetchRecommendations(params)
    }
  }, [params, fetchRecommendations])

  return {
    data,
    loading,
    error,
    refresh,
  }
}

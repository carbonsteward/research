import { useState, useCallback } from 'react'

export interface ProjectFormData {
  // Basic Info
  name: string
  description: string
  projectType: 'AFOLU' | 'ENERGY' | 'TRANSPORT' | 'MANUFACTURING' | 'WASTE' | 'BUILDINGS' | 'OTHER'
  country: string
  region?: string
  coordinates?: string // "lat,lng" format

  // Project Details
  estimatedCredits?: number
  budget?: number
  timeline?: string
  startDate?: string
  duration?: string
  landArea?: string

  // Methodology Selection
  methodologyId?: string
  itmoRequired?: boolean

  // User Context
  userId: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  projectType: string
  status: 'PLANNING' | 'DESIGN' | 'VALIDATION' | 'IMPLEMENTATION' | 'MONITORING' | 'VERIFICATION' | 'COMPLETED' | 'CANCELLED'
  country: string
  region?: string
  coordinates?: string
  estimatedCredits?: number
  budget?: number
  timeline?: string
  methodologyId?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    profileType: string
    organization?: string
  }
  methodology?: {
    id: string
    name: string
    type?: string
    category?: string
    standard: {
      name: string
      abbreviation?: string
    }
  }
  _count: {
    riskAssessments: number
  }
}

export function useProjectCreation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProject = useCallback(async (projectData: ProjectFormData): Promise<Project | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create project: ${response.statusText}`)
      }

      const result: { success: boolean; data: Project } = await response.json()

      if (!result.success) {
        throw new Error('Failed to create project')
      }

      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createProject,
    loading,
    error,
  }
}

export function useUserProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (userIdParam?: string) => {
    if (!userIdParam && !userId) return

    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (userIdParam || userId) {
        queryParams.append('userId', userIdParam || userId!)
      }

      const response = await fetch(`/api/projects?${queryParams}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const result: { success: boolean; data: Project[] } = await response.json()

      if (!result.success) {
        throw new Error('Failed to fetch projects')
      }

      setProjects(result.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const refresh = useCallback(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    refresh,
    fetchProjects,
  }
}

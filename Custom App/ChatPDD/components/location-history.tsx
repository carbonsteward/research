"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MapPin,
  Star,
  Clock,
  Search,
  Trash2,
  Heart,
  HeartOff,
  Copy,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'

interface SavedLocation {
  id: string
  name?: string
  lat: number
  lng: number
  address?: string
  confidence: number
  landmarks?: string[]
  source: 'manual' | 'geospy' | 'bulk' | 'geolocation'
  isFavorite: boolean
  createdAt: string
  lastUsed: string
  useCount: number
  projectIds?: string[]
}

interface LocationHistoryProps {
  onLocationSelect?: (location: { lat: number; lng: number; address?: string; confidence: number }) => void
  currentCoordinates?: string
  className?: string
}

export function LocationHistory({
  onLocationSelect,
  currentCoordinates = "",
  className = ""
}: LocationHistoryProps) {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('all')
  const [sortBy, setSortBy] = useState<'lastUsed' | 'created' | 'name' | 'useCount'>('lastUsed')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)

  // Load locations from localStorage
  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = useCallback(() => {
    try {
      const saved = localStorage.getItem('chatpdd-location-history')
      if (saved) {
        const parsed = JSON.parse(saved) as SavedLocation[]
        setLocations(parsed.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()))
      }
    } catch (error) {
      console.error('Error loading location history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save locations to localStorage
  const saveLocations = useCallback((updatedLocations: SavedLocation[]) => {
    try {
      localStorage.setItem('chatpdd-location-history', JSON.stringify(updatedLocations))
      setLocations(updatedLocations)
    } catch (error) {
      console.error('Error saving location history:', error)
    }
  }, [])

  // Add current coordinates to history
  const saveCurrentLocation = useCallback(() => {
    if (!currentCoordinates.trim()) return

    const [lat, lng] = currentCoordinates.split(',').map(coord => parseFloat(coord.trim()))
    if (isNaN(lat) || isNaN(lng)) return

    const newLocation: SavedLocation = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lat,
      lng,
      confidence: 100, // Manual entry gets 100% confidence
      source: 'manual',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      useCount: 1
    }

    // Check if location already exists (within 0.001 degree tolerance)
    const existing = locations.find(loc =>
      Math.abs(loc.lat - lat) < 0.001 && Math.abs(loc.lng - lng) < 0.001
    )

    if (existing) {
      // Update existing location
      const updated = locations.map(loc =>
        loc.id === existing.id
          ? { ...loc, lastUsed: new Date().toISOString(), useCount: loc.useCount + 1 }
          : loc
      )
      saveLocations(updated)
    } else {
      // Add new location
      const updated = [newLocation, ...locations].slice(0, 100) // Keep max 100 locations
      saveLocations(updated)
    }
  }, [currentCoordinates, locations, saveLocations])

  // Toggle favorite status
  const toggleFavorite = useCallback((locationId: string) => {
    const updated = locations.map(loc =>
      loc.id === locationId ? { ...loc, isFavorite: !loc.isFavorite } : loc
    )
    saveLocations(updated)
  }, [locations, saveLocations])

  // Delete location
  const deleteLocation = useCallback((locationId: string) => {
    const updated = locations.filter(loc => loc.id !== locationId)
    saveLocations(updated)
  }, [locations, saveLocations])

  // Use location
  const useLocation = useCallback((location: SavedLocation) => {
    // Update usage stats
    const updated = locations.map(loc =>
      loc.id === location.id
        ? { ...loc, lastUsed: new Date().toISOString(), useCount: loc.useCount + 1 }
        : loc
    )
    saveLocations(updated)

    // Notify parent component
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        confidence: location.confidence
      })
    }
  }, [locations, saveLocations, onLocationSelect])

  // Add location from external source (GeoSpy, etc.)
  const addExternalLocation = useCallback((
    locationData: {
      lat: number
      lng: number
      address?: string
      confidence: number
      landmarks?: string[]
      source: 'geospy' | 'bulk' | 'geolocation'
      name?: string
    }
  ) => {
    const newLocation: SavedLocation = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...locationData,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      useCount: 1
    }

    // Check for duplicates
    const existing = locations.find(loc =>
      Math.abs(loc.lat - locationData.lat) < 0.001 &&
      Math.abs(loc.lng - locationData.lng) < 0.001
    )

    if (!existing) {
      const updated = [newLocation, ...locations].slice(0, 100)
      saveLocations(updated)
    }
  }, [locations, saveLocations])

  // Filter and sort locations
  const filteredAndSortedLocations = locations
    .filter(location => {
      // Filter by type
      if (filterType === 'favorites' && !location.isFavorite) return false
      if (filterType === 'recent') {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        if (new Date(location.lastUsed) < dayAgo) return false
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          location.name?.toLowerCase().includes(query) ||
          location.address?.toLowerCase().includes(query) ||
          location.landmarks?.some(landmark => landmark.toLowerCase().includes(query)) ||
          `${location.lat},${location.lng}`.includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'lastUsed':
          comparison = new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime()
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'name':
          comparison = (a.name || a.address || '').localeCompare(b.name || b.address || '')
          break
        case 'useCount':
          comparison = a.useCount - b.useCount
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

  // Copy coordinates to clipboard
  const copyCoordinates = useCallback((location: SavedLocation) => {
    const coords = `${location.lat},${location.lng}`
    navigator.clipboard.writeText(coords)
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    if (confirm('Are you sure you want to clear all location history? Favorites will be preserved.')) {
      const favoritesOnly = locations.filter(loc => loc.isFavorite)
      saveLocations(favoritesOnly)
    }
  }, [locations, saveLocations])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Location History & Favorites
            </CardTitle>
            <CardDescription>
              Save and reuse locations across projects
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {currentCoordinates && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveCurrentLocation}
                title="Save current coordinates to history"
              >
                <Heart className="h-4 w-4 mr-1" />
                Save Current
              </Button>
            )}
            {locations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear History
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, address, or coordinates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Filter buttons */}
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All ({locations.length})
            </Button>
            <Button
              variant={filterType === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('favorites')}
            >
              <Star className="h-3 w-3 mr-1" />
              Favorites ({locations.filter(l => l.isFavorite).length})
            </Button>
            <Button
              variant={filterType === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('recent')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Recent 24h
            </Button>

            {/* Sort options */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === 'lastUsed') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                } else {
                  setSortBy('lastUsed')
                  setSortOrder('desc')
                }
              }}
            >
              {sortOrder === 'desc' ? <SortDesc className="h-3 w-3 mr-1" /> : <SortAsc className="h-3 w-3 mr-1" />}
              Last Used
            </Button>
          </div>
        </div>

        {/* Locations List */}
        {filteredAndSortedLocations.length === 0 ? (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              {searchQuery ? 'No locations match your search.' : 'No saved locations yet. Analyze some photos or save coordinates to build your history.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAndSortedLocations.map((location) => (
              <div
                key={location.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {location.confidence}%
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {location.source}
                        </Badge>
                        {location.useCount > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {location.useCount}x used
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(location.id)}
                        className="h-6 w-6 p-0"
                      >
                        {location.isFavorite ? (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>

                    {(location.name || location.address) && (
                      <div className="text-sm font-medium truncate" title={location.name || location.address}>
                        {location.name || location.address}
                      </div>
                    )}

                    <div className="text-xs text-gray-600 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>

                    {location.landmarks && location.landmarks.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        🏛️ {location.landmarks.slice(0, 2).join(', ')}
                        {location.landmarks.length > 2 && ` +${location.landmarks.length - 2} more`}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-1">
                      Last used: {new Date(location.lastUsed).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => useLocation(location)}
                      className="h-8 px-2"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCoordinates(location)}
                      className="h-8 w-8 p-0"
                      title="Copy coordinates"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLocation(location.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Delete location"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {locations.length > 0 && (
          <div className="pt-3 border-t text-xs text-gray-500 flex justify-between">
            <span>{locations.length} total locations</span>
            <span>{locations.filter(l => l.isFavorite).length} favorites</span>
            <span>{locations.reduce((sum, l) => sum + l.useCount, 0)} total uses</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for other components to add locations to history
export function useLocationHistory() {
  const addToHistory = useCallback((locationData: {
    lat: number
    lng: number
    address?: string
    confidence: number
    landmarks?: string[]
    source: 'geospy' | 'bulk' | 'geolocation' | 'manual'
    name?: string
  }) => {
    try {
      const existing = JSON.parse(localStorage.getItem('chatpdd-location-history') || '[]') as SavedLocation[]

      const newLocation: SavedLocation = {
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...locationData,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        useCount: 1
      }

      // Check for duplicates
      const isDuplicate = existing.some(loc =>
        Math.abs(loc.lat - locationData.lat) < 0.001 &&
        Math.abs(loc.lng - locationData.lng) < 0.001
      )

      if (!isDuplicate) {
        const updated = [newLocation, ...existing].slice(0, 100)
        localStorage.setItem('chatpdd-location-history', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Error adding to location history:', error)
    }
  }, [])

  return { addToHistory }
}

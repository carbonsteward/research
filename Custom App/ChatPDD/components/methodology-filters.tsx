import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { useStandards } from "@/hooks/use-standards"
import { MethodologySearchParams } from "@/hooks/use-methodologies"

interface MethodologyFiltersProps {
  filters: MethodologySearchParams
  onFiltersChange: (filters: MethodologySearchParams) => void
  resultCount?: number
  loading?: boolean
}

const PROJECT_TYPES = [
  { id: "AFOLU", name: "Agriculture, Forestry & Land Use" },
  { id: "ENERGY", name: "Energy" },
  { id: "TRANSPORT", name: "Transport" },
  { id: "MANUFACTURING", name: "Manufacturing" },
  { id: "WASTE", name: "Waste Management" },
  { id: "BUILDINGS", name: "Buildings" },
  { id: "OTHER", name: "Other" },
]

const METHODOLOGY_CATEGORIES = [
  "Agriculture, Forestry and Other Land Use",
  "Energy",
  "Renewable Energy",
  "Energy Efficiency",
  "Transport",
  "Manufacturing",
  "Waste",
  "Buildings",
  "REDD+",
  "Afforestation/Reforestation",
  "Land Management",
]

export function MethodologyFilters({
  filters,
  onFiltersChange,
  resultCount,
  loading = false
}: MethodologyFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const { data: standards, loading: standardsLoading } = useStandards({ includeStats: true })

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof MethodologySearchParams, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: MethodologySearchParams = { limit: filters.limit || 20 }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).some(
    key => key !== 'limit' && key !== 'offset' && localFilters[key as keyof MethodologySearchParams] !== undefined
  )

  const activeFilterCount = Object.keys(localFilters).filter(
    key => {
      const value = localFilters[key as keyof MethodologySearchParams]
      return key !== 'limit' && key !== 'offset' && value !== undefined && value !== ''
    }
  ).length

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        {resultCount !== undefined && (
          <div className="text-sm text-gray-600">
            {loading ? 'Searching...' : `${resultCount} methodologies found`}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Methodologies</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              placeholder="Search by name or description..."
              className="pl-8"
              value={localFilters.query || ''}
              onChange={(e) => updateFilter('query', e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Carbon Standards */}
        <div className="space-y-3">
          <Label>Carbon Standard</Label>
          <Select
            value={localFilters.standardId || 'all'}
            onValueChange={(value) => updateFilter('standardId', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All standards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All standards</SelectItem>
              {standards.map((standard) => (
                <SelectItem key={standard.id} value={standard.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{standard.name}</span>
                    {standard._count && (
                      <Badge variant="outline" className="ml-2">
                        {standard._count.methodologies}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {standardsLoading && (
            <div className="text-xs text-gray-500">Loading standards...</div>
          )}
        </div>

        {/* Project Type */}
        <div className="space-y-3">
          <Label>Project Type</Label>
          <Select
            value={localFilters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <Label>Category</Label>
          <Select
            value={localFilters.category || 'all'}
            onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {METHODOLOGY_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ITMO Acceptance */}
        <div className="space-y-3">
          <Label>ITMO Requirements</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="itmo-only"
                checked={localFilters.itmoAcceptance === true}
                onCheckedChange={(checked) =>
                  updateFilter('itmoAcceptance', checked === true ? true : undefined)
                }
              />
              <Label htmlFor="itmo-only" className="text-sm font-normal cursor-pointer">
                ITMO compliant only
              </Label>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t space-y-2">
            <Label className="text-xs font-medium text-gray-700">Active Filters:</Label>
            <div className="flex flex-wrap gap-1">
              {localFilters.query && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{localFilters.query}"
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('query', undefined)}
                  />
                </Badge>
              )}

              {localFilters.standardId && (
                <Badge variant="secondary" className="text-xs">
                  Standard: {standards.find(s => s.id === localFilters.standardId)?.abbreviation || 'Selected'}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('standardId', undefined)}
                  />
                </Badge>
              )}

              {localFilters.type && (
                <Badge variant="secondary" className="text-xs">
                  Type: {localFilters.type}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('type', undefined)}
                  />
                </Badge>
              )}

              {localFilters.category && (
                <Badge variant="secondary" className="text-xs">
                  Category: {localFilters.category}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('category', undefined)}
                  />
                </Badge>
              )}

              {localFilters.itmoAcceptance && (
                <Badge variant="secondary" className="text-xs">
                  ITMO Only
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('itmoAcceptance', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full"
            onClick={clearFilters}
          >
            Reset All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

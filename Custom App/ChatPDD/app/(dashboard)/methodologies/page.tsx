"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react"

import { useMethodologies, useMethodologyRecommendations, MethodologySearchParams } from "@/hooks/use-methodologies"
import { MethodologyCard } from "@/components/methodology-card"
import { MethodologyFilters } from "@/components/methodology-filters"

// Mock user profile for recommendations (this would come from user context in real app)
const MOCK_USER_PROFILE = {
  projectType: 'AFOLU' as const,
  country: 'USA',
  region: 'California',
  itmoRequired: true,
}

export default function MethodologiesPage() {
  const [searchParams, setSearchParams] = useState<MethodologySearchParams>({
    limit: 20,
  })

  // Main methodologies search
  const {
    data: methodologies,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
  } = useMethodologies(searchParams)

  // Recommendations based on user profile
  const {
    data: recommendations,
    loading: recommendationsLoading,
    error: recommendationsError,
    refresh: refreshRecommendations,
  } = useMethodologyRecommendations(MOCK_USER_PROFILE)

  const handleFiltersChange = (newFilters: MethodologySearchParams) => {
    setSearchParams(newFilters)
  }

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      loadMore()
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Methodology Explorer</h1>
        <p className="text-gray-500">
          Browse and compare carbon methodologies from leading certification standards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <MethodologyFilters
            filters={searchParams}
            onFiltersChange={handleFiltersChange}
            resultCount={pagination.total}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All Methodologies
                {pagination.total > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                    {pagination.total}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="recommended">
                Recommended
                {recommendations.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded-full">
                    {recommendations.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All Methodologies Tab */}
            <TabsContent value="all">
              <div className="space-y-4">
                {/* Error State */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{error}</span>
                      <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Loading State */}
                {loading && methodologies.length === 0 && (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Results */}
                {methodologies.length > 0 && (
                  <>
                    <div className="space-y-4">
                      {methodologies.map((methodology) => (
                        <MethodologyCard
                          key={methodology.id}
                          methodology={methodology}
                        />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {pagination.hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={loading}
                          className="min-w-32"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            `Load ${Math.min(searchParams.limit || 20, pagination.total - methodologies.length)} More`
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* No Results */}
                {!loading && !error && methodologies.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="text-gray-500 text-lg">
                          No methodologies match your search criteria
                        </div>
                        <p className="text-gray-400 text-sm max-w-md">
                          Try adjusting your filters or search terms to find more results.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => handleFiltersChange({ limit: searchParams.limit })}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Recommended Methodologies Tab */}
            <TabsContent value="recommended">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recommended Methodologies</CardTitle>
                      <CardDescription>
                        Based on your project profile: {MOCK_USER_PROFILE.projectType} project in {MOCK_USER_PROFILE.country}
                        {MOCK_USER_PROFILE.itmoRequired && ', requiring ITMO compliance'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshRecommendations}
                      disabled={recommendationsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Error State */}
                  {recommendationsError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recommendationsError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Loading State */}
                  {recommendationsLoading && (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <Skeleton className="h-6 w-3/4" />
                              <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-32" />
                              </div>
                              <Skeleton className="h-16 w-full" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && !recommendationsLoading && (
                    <div className="space-y-4">
                      {recommendations.map((methodology) => (
                        <MethodologyCard
                          key={methodology.id}
                          methodology={methodology}
                          showRecommendationScore={true}
                        />
                      ))}
                    </div>
                  )}

                  {/* No Recommendations */}
                  {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="mb-4">
                        No specific recommendations available for your current project profile.
                      </p>
                      <p className="text-sm text-gray-400">
                        Complete your project profile to get personalized methodology recommendations.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Star, AlertCircle, RefreshCw } from "lucide-react"
import { useMethodologyRecommendations, MethodologyRecommendationParams } from "@/hooks/use-methodologies"
import { MethodologyCard } from "@/components/methodology-card"

interface MethodologySelectorProps {
  projectType: 'AFOLU' | 'ENERGY' | 'TRANSPORT' | 'MANUFACTURING' | 'WASTE' | 'BUILDINGS' | 'OTHER'
  country: string
  region?: string
  itmoRequired?: boolean
  selectedMethodologyId?: string
  onMethodologySelect: (methodologyId: string) => void
  onSkip?: () => void
}

export function MethodologySelector({
  projectType,
  country,
  region,
  itmoRequired,
  selectedMethodologyId,
  onMethodologySelect,
  onSkip,
}: MethodologySelectorProps) {
  const [activeTab, setActiveTab] = useState("recommended")

  // Get recommendations based on project parameters
  const recommendationParams: MethodologyRecommendationParams = {
    projectType,
    country,
    region,
    itmoRequired,
  }

  const {
    data: recommendations,
    loading: recommendationsLoading,
    error: recommendationsError,
    refresh: refreshRecommendations,
  } = useMethodologyRecommendations(recommendationParams)

  const handleMethodologySelect = (methodologyId: string) => {
    onMethodologySelect(methodologyId)
  }

  const selectedMethodology = recommendations.find(m => m.id === selectedMethodologyId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Methodology (Optional)</h3>
        <p className="text-gray-600 text-sm">
          Based on your project details, here are recommended methodologies. You can select one now or choose later.
        </p>
      </div>

      {/* Project Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{projectType} Project</Badge>
            <Badge variant="outline">{country}</Badge>
            {region && <Badge variant="outline">{region}</Badge>}
            {itmoRequired && <Badge className="bg-blue-100 text-blue-800">ITMO Required</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Selected Methodology Display */}
      {selectedMethodology && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Selected Methodology</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <MethodologyCard
              methodology={selectedMethodology}
              showRecommendationScore={true}
              compact={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Methodology Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recommended">
            Recommended
            {recommendations.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-200 text-green-800 rounded-full">
                {recommendations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>

        {/* Recommended Tab */}
        <TabsContent value="recommended" className="space-y-4">
          {/* Error State */}
          {recommendationsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{recommendationsError}</span>
                <Button variant="outline" size="sm" onClick={refreshRecommendations}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
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
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recommendations List */}
          {recommendations.length > 0 && !recommendationsLoading && (
            <div className="space-y-4">
              {recommendations.map((methodology) => (
                <Card
                  key={methodology.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedMethodologyId === methodology.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMethodologySelect(methodology.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{methodology.name}</h4>
                          {selectedMethodologyId === methodology.id && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge>{methodology.standard.abbreviation || methodology.standard.name}</Badge>
                          {methodology.type && <Badge variant="outline">{methodology.type}</Badge>}
                          {methodology.category && <Badge variant="outline">{methodology.category}</Badge>}
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="mr-1 h-3 w-3" />
                            Score: {methodology.recommendationScore}
                          </Badge>
                        </div>

                        {methodology.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {methodology.description}
                          </p>
                        )}

                        {methodology.reasons.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-900 mb-1">
                              Why this is recommended:
                            </div>
                            <ul className="text-xs text-green-700 space-y-1">
                              {methodology.reasons.slice(0, 3).map((reason, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <Check className="h-3 w-3 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Recommendations */}
          {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="space-y-4">
                  <div className="text-gray-500">
                    No specific recommendations available for your project profile.
                  </div>
                  <p className="text-sm text-gray-400">
                    You can browse all methodologies or continue without selecting one.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("browse")}>
                    Browse All Methodologies
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Browse All Tab */}
        <TabsContent value="browse">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="text-gray-500">
                  Browse all methodologies feature coming soon.
                </div>
                <p className="text-sm text-gray-400">
                  For now, you can use the recommended methodologies or skip this step.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("recommended")}>
                  View Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip for Now
          </Button>
        )}

        {selectedMethodologyId && (
          <div className="text-sm text-gray-600">
            ✓ Methodology selected
          </div>
        )}
      </div>
    </div>
  )
}

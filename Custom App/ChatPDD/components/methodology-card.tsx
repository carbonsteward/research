import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Users, Calendar, ExternalLink, Check, Star } from "lucide-react"
import { Methodology, MethodologyRecommendation } from "@/hooks/use-methodologies"

interface MethodologyCardProps {
  methodology: Methodology | MethodologyRecommendation
  showRecommendationScore?: boolean
  compact?: boolean
}

export function MethodologyCard({
  methodology,
  showRecommendationScore = false,
  compact = false
}: MethodologyCardProps) {
  const isRecommendation = 'recommendationScore' in methodology
  const recommendation = isRecommendation ? methodology as MethodologyRecommendation : null

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${compact ? 'p-4' : ''}`}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3 flex-1">
            {/* Header */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className={`font-bold leading-tight ${compact ? 'text-base' : 'text-lg'}`}>
                  {methodology.name}
                </h3>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">
                    {methodology.standard.abbreviation || methodology.standard.name}
                  </Badge>

                  {methodology.type && (
                    <Badge variant="outline">{methodology.type}</Badge>
                  )}

                  {methodology.category && (
                    <Badge variant="outline">{methodology.category}</Badge>
                  )}

                  {methodology.itmoAcceptance && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Check className="mr-1 h-3 w-3" />
                      ITMO
                    </Badge>
                  )}

                  {isRecommendation && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Star className="mr-1 h-3 w-3" />
                      Recommended
                    </Badge>
                  )}

                  {showRecommendationScore && recommendation && (
                    <Badge variant="secondary">
                      Score: {recommendation.recommendationScore}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {methodology.description && !compact && (
              <p className="text-gray-600 leading-relaxed">
                {methodology.description}
              </p>
            )}

            {/* Stats and Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {methodology._count.projects > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{methodology._count.projects} projects</span>
                </div>
              )}

              {methodology._count.pddRequirements > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{methodology._count.pddRequirements} requirements</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(methodology.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Standard Info */}
            {!compact && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  {methodology.standard.name}
                </div>
                {methodology.standard.organizationType && (
                  <div className="text-xs text-gray-600">
                    {methodology.standard.organizationType}
                  </div>
                )}
                {methodology.standard.geographicScope && (
                  <div className="text-xs text-gray-600">
                    Scope: {methodology.standard.geographicScope}
                  </div>
                )}
              </div>
            )}

            {/* Recommendation Reasons */}
            {recommendation && recommendation.reasons.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm font-medium text-green-900 mb-1">
                  Why this is recommended:
                </div>
                <ul className="text-xs text-green-700 space-y-1">
                  {recommendation.reasons.map((reason, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <Check className="h-3 w-3 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button asChild size={compact ? "sm" : "default"}>
              <Link href={`/methodologies/${methodology.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {methodology.link && (
              <Button variant="outline" size={compact ? "sm" : "default"} asChild>
                <a
                  href={methodology.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Official Doc
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

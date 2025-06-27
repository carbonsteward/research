import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText } from "lucide-react"

interface RecommendedMethodologyProps {
  methodology: {
    id: string
    name: string
    standard: string
    match: number
    description: string
  }
}

export function RecommendedMethodology({ methodology }: RecommendedMethodologyProps) {
  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600"
    if (match >= 75) return "text-amber-600"
    return "text-gray-600"
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-gray-100 p-2 rounded-full">
            <FileText className="h-4 w-4" />
          </div>
          <div className="space-y-2 flex-1">
            <div>
              <Link href={`/methodologies/${methodology.id}`} className="font-medium hover:underline">
                {methodology.name}
              </Link>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2">
                  {methodology.standard}
                </Badge>
                <span className={`text-sm font-medium ${getMatchColor(methodology.match)}`}>
                  {methodology.match}% match
                </span>
              </div>
            </div>
            <Progress value={methodology.match} className="h-1" />
            <p className="text-sm text-gray-500 line-clamp-2">{methodology.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

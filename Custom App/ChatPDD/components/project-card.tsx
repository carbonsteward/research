import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, ArrowRight, Clock, Globe, Leaf, Shield } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    type: string
    country: string
    status: string
    progress: number
    methodologies: string[]
    risks: {
      physical: string
      transitional: string
    }
    lastUpdated: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "in progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "planning":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Leaf className="h-4 w-4 mr-1" />
              {project.type}
              <Globe className="h-4 w-4 ml-3 mr-1" />
              {project.country}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Project Progress</span>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Methodologies</h4>
              <div className="flex flex-wrap gap-2">
                {project.methodologies.map((methodology, index) => (
                  <Badge key={index} variant="outline">
                    {methodology}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className={getRiskBadgeColor(project.risks.physical)}>
                  <Shield className="h-3 w-3 mr-1" />
                  Physical: {project.risks.physical.charAt(0).toUpperCase() + project.risks.physical.slice(1)}
                </Badge>
                <Badge className={getRiskBadgeColor(project.risks.transitional)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Transitional:{" "}
                  {project.risks.transitional.charAt(0).toUpperCase() + project.risks.transitional.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          Updated: {formatDate(project.lastUpdated)}
        </div>
        <Button asChild>
          <Link href={`/project/${project.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

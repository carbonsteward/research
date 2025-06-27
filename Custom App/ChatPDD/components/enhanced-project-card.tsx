"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlertTriangle, ArrowRight, Clock, Globe, Info, Leaf, Shield } from "lucide-react"

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
    imageUrl?: string
  }
}

export function EnhancedProjectCard({ project }: ProjectCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "in progress":
        return "default"
      case "planning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-600"
    if (progress < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Status indicator bar */}
      <div
        className={`h-1 w-full ${
          project.status.toLowerCase() === "completed"
            ? "bg-green-500"
            : project.status.toLowerCase() === "in progress"
              ? "bg-blue-500"
              : "bg-amber-500"
        }`}
      />

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            {project.imageUrl ? (
              <Avatar className="h-12 w-12 rounded-lg border">
                <AvatarImage src={project.imageUrl} alt={project.name} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {project.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription className="flex items-center mt-1 gap-3">
                <span className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1" />
                  {project.type}
                </span>
                <span className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {project.country}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusVariant(project.status) as any} className="ml-auto">
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Project Progress</span>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                Methodologies
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Standards and methodologies used in this project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.methodologies.map((methodology, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-normal">
                    {methodology}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
              <div className="space-y-1.5">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center justify-between cursor-help p-1.5 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-sm">Physical Risk</span>
                      </div>
                      <span className={`text-sm font-medium ${getRiskColor(project.risks.physical)}`}>
                        {project.risks.physical.charAt(0).toUpperCase() + project.risks.physical.slice(1)}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">Physical risks relate to the impact of climate change on operations, supply chains, and assets.</p>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center justify-between cursor-help p-1.5 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="text-sm">Transitional Risk</span>
                      </div>
                      <span className={`text-sm font-medium ${getRiskColor(project.risks.transitional)}`}>
                        {project.risks.transitional.charAt(0).toUpperCase() + project.risks.transitional.slice(1)}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">Transitional risks arise from the shift to a low-carbon economy, including policy, legal, technology, and market changes.</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
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

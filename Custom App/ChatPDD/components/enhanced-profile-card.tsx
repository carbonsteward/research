"use client"

import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"

interface EnhancedProfileCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
  avatarUrl?: string
  avatarFallback?: string
  tags?: string[]
  infoTooltip?: string
}

export function EnhancedProfileCard({
  icon,
  title,
  description,
  selected,
  onClick,
  avatarUrl,
  avatarFallback = "P",
  tags = [],
  infoTooltip
}: EnhancedProfileCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        selected
          ? "border-primary shadow-md"
          : "hover:border-primary/50"
      }`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-0 right-0 h-0 w-0 border-t-[48px] border-r-[48px] border-t-primary border-r-transparent"></div>
      )}
      {selected && <Check className="absolute top-2 right-2 h-5 w-5 text-white" />}

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="text-primary flex-shrink-0">
            {avatarUrl ? (
              <Avatar>
                <AvatarImage src={avatarUrl} alt={title} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {infoTooltip && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
                <span className="sr-only">Info</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{infoTooltip}</p>
            </HoverCardContent>
          </HoverCard>
        )}
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={onClick}
          variant={selected ? "default" : "outline"}
          className="w-full"
        >
          {selected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  )
}

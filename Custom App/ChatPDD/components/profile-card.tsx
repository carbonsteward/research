"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface ProfileCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export function ProfileCard({ icon, title, description, selected, onClick }: ProfileCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${selected ? "border-green-500 shadow-md" : ""} hover:border-green-300`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <div className="mr-3 text-green-600">{icon}</div>
          <CardTitle>{title}</CardTitle>
        </div>
        {selected && <Check className="h-5 w-5 text-green-600" />}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

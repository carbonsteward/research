"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MainNavigation } from "@/components/main-navigation"
import { Leaf, Settings, User } from "lucide-react"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">ChatPDD</span>
            <span className="text-xs text-muted-foreground">Carbon Project Assistant</span>
          </div>
        </Link>

        {/* Main Navigation */}
        <MainNavigation className="hidden md:flex" />

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Feature Badge */}
          <Badge variant="outline" className="hidden lg:flex bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            🤖 AI-Powered Location Detection
          </Badge>

          {/* User Actions */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  FileText,
  Globe,
  Home,
  MapPin,
  PlusCircle,
  Settings,
  Shield,
  Sparkles,
  User
} from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Location Intelligence",
    href: "/project/geospy",
    icon: MapPin,
    badge: "AI",
    description: "Photo-based coordinate detection"
  },
  {
    title: "Projects",
    href: "/project",
    icon: PlusCircle,
    children: [
      {
        title: "Create Project",
        href: "/project/new",
        description: "Start a new carbon mitigation project"
      },
      {
        title: "Project Location",
        href: "/project/location",
        description: "Define project boundaries and coordinates"
      },
      {
        title: "Risk Assessment",
        href: "/project/risk-assessment",
        description: "Analyze climate and transitional risks"
      }
    ]
  },
  {
    title: "Tools",
    href: "#",
    icon: FileText,
    children: [
      {
        title: "Methodology Explorer",
        href: "/methodologies",
        description: "Browse carbon credit methodologies",
        icon: FileText
      },
      {
        title: "Risk Assessment",
        href: "/risks",
        description: "Climate risk analysis and visualization",
        icon: Shield
      },
      {
        title: "Policy Navigator",
        href: "/policies",
        description: "Track climate policies and regulations",
        icon: Globe
      },
      {
        title: "Analytics",
        href: "/analytics",
        description: "Project performance and insights",
        icon: BarChart3
      }
    ]
  }
]

interface MainNavigationProps {
  className?: string
}

export function MainNavigation({ className }: MainNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.title}>
              {item.children ? (
                <>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      {item.title === "Tools" && (
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/project/geospy"
                            >
                              <MapPin className="h-6 w-6" />
                              <div className="mb-2 mt-4 text-lg font-medium">
                                GeoSpy AI
                                <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  NEW
                                </Badge>
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Upload photos to automatically detect project coordinates with AI-powered location intelligence.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      )}
                      <div className="grid gap-2">
                        {item.children.map((child) => (
                          <li key={child.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.href}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  pathname === child.href && "bg-accent text-accent-foreground"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {child.icon && <child.icon className="h-4 w-4" />}
                                  <div className="text-sm font-medium leading-none">
                                    {child.title}
                                  </div>
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {child.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </div>
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === item.href && "bg-accent text-accent-foreground",
                      "flex items-center gap-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {item.badge}
                      </Badge>
                    )}
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

// Floating Action Button for GeoSpy AI
export function GeoSpyFloatingButton() {
  const pathname = usePathname()

  // Don't show on GeoSpy page itself
  if (pathname === "/project/geospy") return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        asChild
        size="lg"
        className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        <Link href="/project/geospy">
          <MapPin className="h-5 w-5 mr-2" />
          Detect Location
          <Badge className="ml-2 bg-white/20">
            <Sparkles className="h-3 w-3" />
          </Badge>
        </Link>
      </Button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Thermometer,
  Wind,
  Cloud,
  Waves,
  AlertTriangle,
  FileText,
  Scale,
  BarChart,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  MapPin
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// This would be replaced with actual API calls in the production version
const mockPhysicalRisks = [
  {
    id: "temperature",
    name: "Temperature Rise",
    icon: Thermometer,
    currentLevel: "Medium",
    riskScore: 65,
    description: "Projected average temperature increase of 2.1°C by 2050 under current policy scenarios.",
    impact: "Higher temperatures may affect growing conditions for forestry projects and increase wildfire risk.",
    trend: "Increasing",
    dataSource: "NGFS Climate Scenarios"
  },
  {
    id: "precipitation",
    name: "Precipitation Change",
    icon: Cloud,
    currentLevel: "Medium-High",
    riskScore: 75,
    description: "Shift in precipitation patterns with 15% decrease in summer rainfall and 10% increase in winter rainfall.",
    impact: "Changes in water availability could impact plant growth and carbon sequestration rates.",
    trend: "Changing",
    dataSource: "Climate Impact Explorer"
  },
  {
    id: "extremeWeather",
    name: "Extreme Weather Events",
    icon: Wind,
    currentLevel: "High",
    riskScore: 85,
    description: "Increased frequency of extreme weather events including storms and droughts.",
    impact: "Direct physical damage to project sites and disruption to implementation activities.",
    trend: "Increasing Rapidly",
    dataSource: "ISIMIP Database"
  },
  {
    id: "sealevel",
    name: "Sea Level Rise",
    icon: Waves,
    currentLevel: "Low",
    riskScore: 25,
    description: "Projected sea level rise of 0.3m by 2050, with limited direct impact on project area.",
    impact: "Minimal direct impact on project site due to elevation, but may affect surrounding ecosystems.",
    trend: "Increasing Steadily",
    dataSource: "IPCC AR6"
  }
]

const mockTransitionalRisks = [
  {
    id: "policy",
    name: "Policy & Regulation",
    icon: FileText,
    currentLevel: "Medium",
    riskScore: 60,
    description: "3 national policies and 2 regional regulations directly impacting carbon markets identified.",
    impact: "Potential changes to carbon credit certification requirements and trading rules.",
    trend: "Evolving",
    dataSource: "Climate Policy Radar"
  },
  {
    id: "market",
    name: "Market Changes",
    icon: BarChart,
    currentLevel: "Medium-Low",
    riskScore: 45,
    description: "Market demand for carbon credits projected to grow but with price volatility expected.",
    impact: "Uncertainty in long-term revenue projections for carbon credit sales.",
    trend: "Fluctuating",
    dataSource: "Carbon Market Analysis"
  },
  {
    id: "legal",
    name: "Legal Liability",
    icon: Scale,
    currentLevel: "Low",
    riskScore: 30,
    description: "Limited legal liabilities identified in current regulatory framework.",
    impact: "Potential future legal challenges regarding ownership of carbon rights.",
    trend: "Stable",
    dataSource: "FAO FAOLEX"
  },
  {
    id: "reputation",
    name: "Reputational Risk",
    icon: AlertTriangle,
    currentLevel: "Medium",
    riskScore: 55,
    description: "Growing scrutiny of carbon offset projects for environmental integrity and social impacts.",
    impact: "Potential challenges to project credibility affecting market acceptance.",
    trend: "Increasing",
    dataSource: "Carbon Market Reputation Index"
  }
]

// This component displays an individual risk item
const RiskItem = ({ risk }: { risk: any }) => {
  const Icon = risk.icon

  const getRiskColorClass = (score: number) => {
    if (score >= 80) return "text-red-500"
    if (score >= 60) return "text-orange-500"
    if (score >= 40) return "text-yellow-500"
    return "text-green-500"
  }

  const getProgressColorClass = (score: number) => {
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-orange-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${getRiskColorClass(risk.riskScore)}`} />
          {risk.name}
        </CardTitle>
        <CardDescription>{risk.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Risk Level: {risk.currentLevel}</span>
            <span className={`font-medium ${getRiskColorClass(risk.riskScore)}`}>{risk.riskScore}%</span>
          </div>
          <Progress value={risk.riskScore} className="h-2" indicatorClassName={getProgressColorClass(risk.riskScore)} />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium">Potential Impact</h4>
          <p className="text-sm text-muted-foreground">{risk.impact}</p>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline">Trend: {risk.trend}</Badge>
          <span className="text-xs text-muted-foreground">Source: {risk.dataSource}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RiskAssessmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [location, setLocation] = useState<any>(null)

  // Get the location data from localStorage in a real app
  // This simulates retrieving the previously selected location
  useEffect(() => {
    // Simulate API call to get location data
    setTimeout(() => {
      setLocation({
        lat: 37.7749,
        lng: -122.4194,
        address: "San Francisco, CA, USA"
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  // Generate an overall risk score based on individual risks
  const calculateOverallRisk = (risks: any[]) => {
    const total = risks.reduce((sum, risk) => sum + risk.riskScore, 0)
    return Math.round(total / risks.length)
  }

  const physicalRiskScore = calculateOverallRisk(mockPhysicalRisks)
  const transitionalRiskScore = calculateOverallRisk(mockTransitionalRisks)
  const overallRiskScore = Math.round((physicalRiskScore + transitionalRiskScore) / 2)

  const getScoreCategory = (score: number) => {
    if (score >= 80) return { label: "High", color: "text-red-500 bg-red-50" }
    if (score >= 60) return { label: "Medium-High", color: "text-orange-500 bg-orange-50" }
    if (score >= 40) return { label: "Medium", color: "text-yellow-500 bg-yellow-50" }
    if (score >= 20) return { label: "Medium-Low", color: "text-green-500 bg-green-50" }
    return { label: "Low", color: "text-green-700 bg-green-50" }
  }

  const physicalCategory = getScoreCategory(physicalRiskScore)
  const transitionalCategory = getScoreCategory(transitionalRiskScore)
  const overallCategory = getScoreCategory(overallRiskScore)

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Climate Risk Assessment</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analysis of physical and transitional climate risks for your project
        </p>
      </div>

      {/* Location information */}
      {location && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Project Location</h3>
                <p className="text-muted-foreground">{location.address}</p>
                <p className="text-xs text-muted-foreground mt-1">Coordinates: {location.lat}, {location.lng}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Climate Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-2">
              <div className={`text-4xl font-bold ${overallCategory.color} rounded-full p-6 h-24 w-24 flex items-center justify-center mb-4`}>
                {overallRiskScore}%
              </div>
              <Badge className={overallCategory.color.replace('text-', 'bg-').replace('bg-', 'text-')} variant="outline">
                {overallCategory.label} Risk
              </Badge>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Combined assessment of physical and transitional climate risks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Physical Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-2">
              <div className={`text-4xl font-bold ${physicalCategory.color} rounded-full p-6 h-24 w-24 flex items-center justify-center mb-4`}>
                {physicalRiskScore}%
              </div>
              <Badge className={physicalCategory.color.replace('text-', 'bg-').replace('bg-', 'text-')} variant="outline">
                {physicalCategory.label} Risk
              </Badge>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Assessment of physical climate hazards at project location
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transitional Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center pt-2">
              <div className={`text-4xl font-bold ${transitionalCategory.color} rounded-full p-6 h-24 w-24 flex items-center justify-center mb-4`}>
                {transitionalRiskScore}%
              </div>
              <Badge className={transitionalCategory.color.replace('text-', 'bg-').replace('bg-', 'text-')} variant="outline">
                {transitionalCategory.label} Risk
              </Badge>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Policy, market, and regulatory risks affecting your project
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Tabs */}
      <Tabs defaultValue="physical" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="physical">
            <Thermometer className="h-4 w-4 mr-2" />
            Physical Risks
          </TabsTrigger>
          <TabsTrigger value="transitional">
            <FileText className="h-4 w-4 mr-2" />
            Transitional Risks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physical" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {mockPhysicalRisks.map((risk) => (
              <RiskItem key={risk.id} risk={risk} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transitional" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {mockTransitionalRisks.map((risk) => (
              <RiskItem key={risk.id} risk={risk} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Adaptation Recommendations */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Risk Mitigation Recommendations
          </CardTitle>
          <CardDescription>
            Based on the identified risks, consider the following mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <span>Consider diversifying project activities across multiple sites to reduce exposure to localized physical risks.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <span>Engage with policy makers and stay informed about evolving regulations in the carbon market space.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <span>Implement enhanced monitoring protocols to track project performance under changing climate conditions.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <span>Explore multiple carbon standard certifications to reduce exposure to market and policy risks.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => router.push("/project/location")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Location
        </Button>
        <Button onClick={() => router.push("/methodologies")}>
          View Recommended Methodologies
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Globe,
  Leaf,
  Factory,
  Zap,
  ArrowRight,
  Clock,
  DollarSign,
  Shield
} from "lucide-react"

interface Methodology {
  id: string
  name: string
  standard: string
  type: "Avoidance" | "Removal" | "Reduction"
  category: string
  popularity: number
  successRate: number
  avgTimeline: string
  avgCost: string
  itmoCompliant: boolean
  regions: string[]
  description: string
  benefits: string[]
}

// Mock data for demonstration
const mockMethodologies: Methodology[] = [
  {
    id: "vcs-afolu-001",
    name: "Afforestation, Reforestation and Revegetation",
    standard: "VCS",
    type: "Removal",
    category: "AFOLU",
    popularity: 98,
    successRate: 94,
    avgTimeline: "18-24 months",
    avgCost: "$45,000-75,000",
    itmoCompliant: true,
    regions: ["Global", "Tropical", "Temperate"],
    description: "Comprehensive methodology for forest restoration projects that sequester carbon in biomass and soils.",
    benefits: ["High carbon impact", "Biodiversity co-benefits", "Community engagement", "Long-term permanence"]
  },
  {
    id: "gs-energy-001",
    name: "Grid-connected Renewable Electricity Generation",
    standard: "Gold Standard",
    type: "Avoidance",
    category: "Energy",
    popularity: 89,
    successRate: 91,
    avgTimeline: "12-18 months",
    avgCost: "$35,000-55,000",
    itmoCompliant: false,
    regions: ["Global", "Developing Countries"],
    description: "Methodology for renewable energy projects that displace grid electricity from fossil fuels.",
    benefits: ["Proven track record", "Sustainable development", "Scalable impact", "Economic viability"]
  },
  {
    id: "acr-waste-001",
    name: "Landfill Gas Capture and Destruction",
    standard: "ACR",
    type: "Avoidance",
    category: "Waste",
    popularity: 76,
    successRate: 88,
    avgTimeline: "6-12 months",
    avgCost: "$25,000-40,000",
    itmoCompliant: true,
    regions: ["Americas", "Europe"],
    description: "Capture and destruction of methane emissions from landfill sites.",
    benefits: ["Fast implementation", "Lower costs", "Immediate impact", "Technology proven"]
  }
]

function MethodologyCard({ methodology, isSelected, onClick }: {
  methodology: Methodology
  isSelected: boolean
  onClick: () => void
}) {
  const typeColors = {
    Avoidance: "bg-blue-100 text-blue-800",
    Removal: "bg-green-100 text-green-800",
    Reduction: "bg-purple-100 text-purple-800"
  }

  const typeIcons = {
    Avoidance: Shield,
    Removal: Leaf,
    Reduction: TrendingUp
  }

  const TypeIcon = typeIcons[methodology.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'ring-2 ring-emerald-500 shadow-lg bg-emerald-50'
            : 'hover:shadow-md hover:bg-gray-50'
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {methodology.standard}
                </Badge>
                <Badge className={`text-xs ${typeColors[methodology.type]}`}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {methodology.type}
                </Badge>
                {methodology.itmoCompliant && (
                  <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                    ITMO
                  </Badge>
                )}
              </div>

              <CardTitle className="text-lg leading-tight mb-2">
                {methodology.name}
              </CardTitle>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{methodology.popularity}% popular</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{methodology.successRate}% success</span>
                </div>
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {methodology.description}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{methodology.avgTimeline}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{methodology.avgCost}</span>
            </div>
          </div>

          {/* Regions */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="flex gap-1 flex-wrap">
              {methodology.regions.map((region) => (
                <Badge key={region} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Key Benefits:</div>
            <div className="grid grid-cols-2 gap-1">
              {methodology.benefits.slice(0, 4).map((benefit) => (
                <div key={benefit} className="flex items-center gap-1 text-xs text-gray-600">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function InteractiveMethodologyShowcase() {
  const [methodologies, setMethodologies] = useState(mockMethodologies)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMethodology, setSelectedMethodology] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"All" | "Avoidance" | "Removal" | "Reduction">("All")
  const [isLoading, setIsLoading] = useState(false)

  // Filter methodologies based on search and type
  const filteredMethodologies = methodologies.filter(methodology => {
    const matchesSearch = methodology.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         methodology.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         methodology.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "All" || methodology.type === filterType

    return matchesSearch && matchesType
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMethodologies(prev => prev.map(methodology => ({
        ...methodology,
        popularity: Math.max(70, Math.min(100, methodology.popularity + (Math.random() - 0.5) * 2))
      })))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query: string) => {
    setIsLoading(true)
    setSearchQuery(query)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-4 px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-700">
          <Zap className="h-4 w-4 mr-2" />
          Interactive Demo
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Explore Carbon Methodologies
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the perfect methodology for your project with our intelligent matching system
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search methodologies by name, type, or description..."
            className="pl-10 pr-4 py-3 text-base"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {["All", "Avoidance", "Removal", "Reduction"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type as any)}
              className="flex items-center gap-1"
            >
              {type === "Avoidance" && <Shield className="h-4 w-4" />}
              {type === "Removal" && <Leaf className="h-4 w-4" />}
              {type === "Reduction" && <TrendingUp className="h-4 w-4" />}
              {type === "All" && <Filter className="h-4 w-4" />}
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center">
        <motion.div
          key={filteredMethodologies.length}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-gray-600"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            `Showing ${filteredMethodologies.length} methodologies`
          )}
        </motion.div>
      </div>

      {/* Methodology Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredMethodologies.map((methodology) => (
            <MethodologyCard
              key={methodology.id}
              methodology={methodology}
              isSelected={selectedMethodology === methodology.id}
              onClick={() => setSelectedMethodology(
                selectedMethodology === methodology.id ? null : methodology.id
              )}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && filteredMethodologies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No methodologies found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterType("All") }}>
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Selected Methodology Detail */}
      <AnimatePresence>
        {selectedMethodology && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Great Choice!
                  </h3>
                  <p className="text-gray-700 mb-6">
                    You've selected a methodology with a {
                      mockMethodologies.find(m => m.id === selectedMethodology)?.successRate
                    }% success rate. Ready to start your project assessment?
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 group">
                      Start Project Assessment
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" size="lg">
                      Learn More About This Methodology
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <div className="text-center pt-12">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to find your perfect methodology?
          </h3>
          <p className="text-gray-600 mb-6">
            Our AI-powered recommendation engine can match you with the ideal methodology
            based on your project specifics in under 60 seconds.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 group">
            Get Personalized Recommendations
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}

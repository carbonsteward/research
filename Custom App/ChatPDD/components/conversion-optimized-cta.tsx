"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Star,
  Shield,
  Trophy,
  Timer,
  AlertCircle,
  Mail,
  Phone,
  Calendar
} from "lucide-react"
import Link from "next/link"

// A/B Testing Variants
type CTAVariant = "urgency" | "social_proof" | "value_focused" | "risk_mitigation"

interface ConversionData {
  activeUsers: number
  projectsCreated: number
  successRate: number
  avgSavings: number
}

// Simulated real-time conversion data
function useConversionData(): ConversionData {
  const [data, setData] = useState<ConversionData>({
    activeUsers: 847,
    projectsCreated: 23,
    successRate: 94.2,
    avgSavings: 247000
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        projectsCreated: prev.projectsCreated + (Math.random() > 0.7 ? 1 : 0),
        successRate: Math.max(90, Math.min(98, prev.successRate + (Math.random() - 0.5) * 0.5)),
        avgSavings: prev.avgSavings + Math.floor((Math.random() - 0.5) * 10000)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return data
}

// Live activity feed component
function LiveActivityFeed() {
  const [activities, setActivities] = useState([
    { id: 1, user: "Sarah C.", action: "completed AFOLU project assessment", time: "2 min ago", location: "Brazil" },
    { id: 2, user: "Michael R.", action: "found optimal methodology", time: "5 min ago", location: "Kenya" },
    { id: 3, user: "Dr. Patel", action: "saved $320K in development costs", time: "8 min ago", location: "India" }
  ])

  useEffect(() => {
    const newActivities = [
      { user: "Emma L.", action: "validated carbon project", location: "Indonesia" },
      { user: "Carlos M.", action: "reduced timeline by 6 months", location: "Colombia" },
      { user: "Dr. Chen", action: "achieved 98% compliance score", location: "Malaysia" },
      { user: "James K.", action: "completed risk assessment", location: "Uganda" },
      { user: "Maria S.", action: "found ITMO-compliant methodology", location: "Peru" }
    ]

    const interval = setInterval(() => {
      const randomActivity = newActivities[Math.floor(Math.random() * newActivities.length)]
      setActivities(prev => [
        {
          id: Date.now(),
          ...randomActivity,
          time: "Just now"
        },
        ...prev.slice(0, 2)
      ])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-700">Live Activity</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="text-sm"
            >
              <div className="font-medium text-gray-900">{activity.user}</div>
              <div className="text-gray-600">{activity.action}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{activity.time}</span>
                <span>•</span>
                <span>{activity.location}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Countdown timer for urgency
function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 32
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Reset timer
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <Timer className="h-5 w-5 text-red-600" />
      <div>
        <div className="font-medium text-red-900">Limited Time: Beta Access</div>
        <div className="text-sm text-red-700">
          Free assessment expires in{" "}
          <span className="font-mono font-bold">
            {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}

// Main CTA component with A/B testing
export function ConversionOptimizedCTA({ variant = "value_focused" }: { variant?: CTAVariant }) {
  const conversionData = useConversionData()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setShowThankYou(true)
  }

  // Variant-specific content
  const getContent = () => {
    switch (variant) {
      case "urgency":
        return {
          badge: { icon: Timer, text: "Limited Time Offer", color: "bg-red-100 text-red-700 border-red-200" },
          headline: "Don't Miss Out: Free Carbon Project Assessment",
          subheadline: "Join 500+ developers who transformed their projects. Beta access ending soon!",
          primaryCTA: "Claim Free Assessment",
          secondaryCTA: "Watch Demo",
          features: [
            "⏰ 24-hour turnaround time",
            "🔥 $50,000 average cost savings",
            "⚡ AI-powered methodology matching",
            "🎯 94% project success rate"
          ]
        }

      case "social_proof":
        return {
          badge: { icon: Users, text: "Trusted by 500+ Projects", color: "bg-blue-100 text-blue-700 border-blue-200" },
          headline: "Join Industry Leaders Using ChatPDD",
          subheadline: "Developers at top organizations rely on our platform for carbon project success",
          primaryCTA: "Join the Community",
          secondaryCTA: "Read Case Studies",
          features: [
            "👥 500+ active project developers",
            "🏆 94% average success rate",
            "🌍 Projects in 89+ countries",
            "⭐ 4.9/5 average rating"
          ]
        }

      case "risk_mitigation":
        return {
          badge: { icon: Shield, text: "Risk-Free Assessment", color: "bg-green-100 text-green-700 border-green-200" },
          headline: "Eliminate Carbon Project Risks Before They Cost You",
          subheadline: "Avoid the $2M+ mistakes that 40% of projects make. Get expert risk analysis first.",
          primaryCTA: "Get Risk Assessment",
          secondaryCTA: "Download Risk Guide",
          features: [
            "🛡️ Comprehensive risk analysis",
            "📊 Climate data integration",
            "⚠️ Early warning systems",
            "💰 Average $250K saved per project"
          ]
        }

      default: // value_focused
        return {
          badge: { icon: Trophy, text: "Proven Results", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
          headline: "Turn Your Climate Vision Into Certified Reality",
          subheadline: "The complete platform for carbon project success - from feasibility to certification",
          primaryCTA: "Start Free Assessment",
          secondaryCTA: "Explore Platform",
          features: [
            "🚀 75% faster project development",
            "💵 $250K average cost savings",
            "✅ 94% certification success rate",
            "🌍 47+ approved methodologies"
          ]
        }
    }
  }

  const content = getContent()

  if (showThankYou) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto text-center py-16"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to ChatPDD!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Check your email for instant access to your personalized carbon project dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard" className="flex items-center">
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <Calendar className="mr-2 h-5 w-5" />
            Schedule Onboarding Call
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310b981" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main CTA */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge variant="outline" className={`px-4 py-2 ${content.badge.color} font-medium`}>
                  <content.badge.icon className="h-4 w-4 mr-2" />
                  {content.badge.text}
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  {content.headline}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {content.subheadline}
                </p>
              </motion.div>

              {/* Urgency Timer (for urgency variant) */}
              {variant === "urgency" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <UrgencyTimer />
                </motion.div>
              )}

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                {content.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200"
                  >
                    <span className="text-2xl">{feature.split(" ")[0]}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {feature.substring(feature.indexOf(" ") + 1)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Email Capture Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your work email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 pr-4 py-4 text-base border-2 border-gray-200 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <Button
                      size="lg"
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-base font-semibold group whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          {content.primaryCTA}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Free for 30 days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>No credit card</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </form>
              </motion.div>

              {/* Secondary CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button variant="outline" size="lg" className="group">
                  {content.secondaryCTA}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>

            {/* Right Column - Social Proof & Stats */}
            <div className="space-y-8">
              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                      Live Platform Stats
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      {[
                        {
                          label: "Active Users",
                          value: conversionData.activeUsers.toLocaleString(),
                          icon: Users,
                          color: "text-blue-600"
                        },
                        {
                          label: "Projects Today",
                          value: conversionData.projectsCreated.toString(),
                          icon: TrendingUp,
                          color: "text-emerald-600"
                        },
                        {
                          label: "Success Rate",
                          value: `${conversionData.successRate.toFixed(1)}%`,
                          icon: CheckCircle2,
                          color: "text-green-600"
                        },
                        {
                          label: "Avg. Savings",
                          value: `$${(conversionData.avgSavings / 1000).toFixed(0)}K`,
                          icon: DollarSign,
                          color: "text-purple-600"
                        }
                      ].map((stat) => (
                        <motion.div
                          key={stat.label}
                          className="text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                          <motion.div
                            key={stat.value}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-2xl font-bold text-gray-900"
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Live Activity Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <LiveActivityFeed />
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">Enterprise Security</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: "SOC 2", icon: "🔒" },
                        { label: "ISO 27001", icon: "🛡️" },
                        { label: "GDPR", icon: "🇪🇺" }
                      ].map((cert) => (
                        <div key={cert.label} className="text-sm">
                          <div className="text-2xl mb-1">{cert.icon}</div>
                          <div className="font-medium text-gray-700">{cert.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

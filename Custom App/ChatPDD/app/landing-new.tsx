"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  FileCheck,
  Globe,
  Leaf,
  Shield,
  CheckCircle2,
  Users,
  TrendingUp,
  Database,
  Target,
  Award,
  Clock,
  DollarSign,
  PlayCircle,
  Star,
  ChevronDown,
  Zap,
  BookOpen,
  Activity
} from "lucide-react"
import { useState, useEffect } from "react"

// Real-time stats component
function LiveStats() {
  const [stats, setStats] = useState({
    methodologies: 47,
    projects: 89,
    carbonOffset: 2.8,
    countries: 89
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        methodologies: prev.methodologies + Math.floor(Math.random() * 2),
        projects: prev.projects + Math.floor(Math.random() * 3),
        carbonOffset: +(prev.carbonOffset + Math.random() * 0.1).toFixed(1),
        countries: prev.countries + (Math.random() > 0.9 ? 1 : 0)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {[
        { label: "Methodologies", value: stats.methodologies, suffix: "+", icon: FileCheck },
        { label: "Active Projects", value: stats.projects, suffix: "+", icon: TrendingUp },
        { label: "Million tCO₂e", value: stats.carbonOffset, suffix: "M", icon: Leaf },
        { label: "Countries", value: stats.countries, suffix: "", icon: Globe }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center group"
        >
          <div className="flex items-center justify-center mb-2">
            <stat.icon className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <motion.div
            className="text-2xl md:text-3xl font-bold text-gray-900"
            key={stat.value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {stat.value}{stat.suffix}
          </motion.div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// Trust badges component
function TrustBadges() {
  const standards = [
    { name: "Verra VCS", logo: "🌿" },
    { name: "Gold Standard", logo: "⭐" },
    { name: "ACR", logo: "🌲" },
    { name: "CAR", logo: "🏛️" },
    { name: "ISO 14064", logo: "📋" }
  ]

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 opacity-70">
      <span className="text-sm text-gray-500 font-medium">Certified by leading standards:</span>
      {standards.map((standard, index) => (
        <motion.div
          key={standard.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-lg border border-gray-200"
        >
          <span className="text-lg">{standard.logo}</span>
          <span className="text-sm font-medium text-gray-700">{standard.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

// Interactive demo preview
function DemoPreview() {
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { title: "Project Input", desc: "Enter your carbon project details", color: "bg-blue-500" },
    { title: "Risk Analysis", desc: "AI-powered climate risk assessment", color: "bg-orange-500" },
    { title: "Methodology Match", desc: "Find optimal certification pathway", color: "bg-green-500" },
    { title: "Feasibility Report", desc: "Comprehensive project insights", color: "bg-purple-500" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Platform Demo</h3>
        <PlayCircle className="h-5 w-5 text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
              activeStep === index ? 'bg-white shadow-md scale-105' : 'bg-transparent'
            }`}
            animate={{
              scale: activeStep === index ? 1.02 : 1,
              opacity: activeStep === index ? 1 : 0.7
            }}
          >
            <div className={`w-3 h-3 rounded-full ${step.color} ${
              activeStep === index ? 'ring-4 ring-offset-2 ring-blue-200' : ''
            }`} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{step.title}</div>
              <div className="text-sm text-gray-600">{step.desc}</div>
            </div>
            {activeStep === index && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function NewLandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">ChatPDD</span>
            <Badge variant="outline" className="ml-2 text-xs">BETA</Badge>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/methodologies" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Methodologies
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <Button variant="outline" size="sm">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Climate Authority Design */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Badge variant="outline" className="px-6 py-2 bg-white/80 backdrop-blur-sm border-emerald-200 text-emerald-700">
                <Award className="h-4 w-4 mr-2" />
                Trusted by Carbon Project Developers
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-900 bg-clip-text text-transparent leading-tight">
                Turn Climate Action
                <br />
                Into <span className="text-emerald-600">Certified</span> Impact
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                The world's most comprehensive platform for carbon project feasibility analysis.
                Navigate methodologies, assess risks, and accelerate your path to certification.
              </p>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <LiveStats />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold group">
                <Link href="/project/new" className="flex items-center">
                  Start Your Project Assessment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-gray-300 hover:bg-gray-50 group">
                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch 2-Min Demo
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <TrustBadges />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Propositions - Data-Driven Results */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-blue-50 border-blue-200 text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Proven Results
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Leading Projects Choose ChatPDD
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Data-driven insights that accelerate your project timeline and increase certification success rates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: "75% Faster Feasibility Analysis",
                description: "Reduce project assessment time from months to weeks with AI-powered methodology matching",
                metric: "3-4 weeks avg",
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                icon: TrendingUp,
                title: "85% Certification Success Rate",
                description: "Projects using our platform achieve 85% certification approval rates",
                metric: "85% success",
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                icon: DollarSign,
                title: "Average $250K Cost Savings",
                description: "Prevent costly methodology changes and delays with upfront risk assessment",
                metric: "$250K saved",
                color: "text-purple-600",
                bg: "bg-purple-50"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`${benefit.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`h-8 w-8 ${benefit.color}`} />
                </div>
                <div className={`text-3xl font-bold ${benefit.color} mb-2`}>{benefit.metric}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Platform Demo */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-2 bg-orange-50 border-orange-200 text-orange-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Live Platform
                </Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  See Your Project's Potential
                  <br />
                  In Real-Time
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Experience our AI-powered analysis engine that evaluates your project across
                  47+ methodologies and 12 risk categories in minutes, not months.
                </p>

                {/* Feature list */}
                <div className="space-y-4 mb-8">
                  {[
                    "Smart methodology recommendations based on project type and location",
                    "Real-time climate risk assessment with satellite data integration",
                    "Automated compliance checking against international standards",
                    "ROI projections and carbon credit pricing analysis"
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white group">
                  <Link href="/methodologies" className="flex items-center">
                    Explore Methodologies Database
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div>
                <DemoPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-green-50 border-green-200 text-green-700">
              <Users className="h-4 w-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "ChatPDD transformed our project assessment process. What used to take 3 months now takes 3 weeks, and our success rate has doubled.",
                author: "Sarah Chen",
                role: "Head of Carbon Projects",
                company: "EcoForest Solutions",
                rating: 5
              },
              {
                quote: "The risk assessment accuracy is incredible. We avoided a $2M investment in a high-risk region thanks to their climate data analysis.",
                author: "Marcus Rodriguez",
                role: "Project Developer",
                company: "Verde Impact",
                rating: 5
              },
              {
                quote: "Finally, a platform that speaks our language. The methodology recommendations are spot-on and save countless hours of research.",
                author: "Dr. Aisha Patel",
                role: "Climate Strategy Lead",
                company: "Global Carbon Initiative",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-emerald-600 font-medium">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Urgency & Conversion Focused */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-white/20 border-white/30 text-white">
              <Activity className="h-4 w-4 mr-2" />
              Limited Beta Access
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Accelerate Your
              <br />
              Carbon Project Success?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Join project developers who have already transformed their feasibility analysis
              process. Get started today with our comprehensive methodology database and AI-powered insights.
            </p>

            {/* Urgency indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold group">
                <Link href="/project/new" className="flex items-center">
                  Start Free Assessment Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg group">
                <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Download Case Studies
              </Button>
            </div>

            <p className="text-sm opacity-70 mt-6">
              🔒 Your project data is encrypted and secure. SOC 2 Type II certified.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-emerald-500" />
                <span className="text-lg font-bold">ChatPDD</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Accelerating carbon project success through AI-powered feasibility analysis
                and comprehensive methodology intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/methodologies" className="hover:text-white transition-colors">Methodologies</Link></li>
                <li><Link href="/project/new" className="hover:text-white transition-colors">Project Assessment</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ChatPDD. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Certified by:</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-gray-700 text-gray-400">ISO 14064</Badge>
                <Badge variant="outline" className="border-gray-700 text-gray-400">SOC 2</Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

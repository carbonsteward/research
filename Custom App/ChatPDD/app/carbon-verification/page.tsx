"use client"

/**
 * Enhanced Carbon Verification Calculator Page
 * Based on Isometric's monthly verification system with ChatPDD enhancements
 */

import React from 'react'
import { VerificationCalculator } from '@/components/carbon-verification/verification-calculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowLeft,
  Info,
  Lightbulb,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function CarbonVerificationPage() {
  const handleSaveModel = (model: any) => {
    console.log('Model saved:', model)
    // Could show a toast notification here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carbon Verification Calculator</h1>
              <p className="text-gray-600 mt-1">
                Enhanced financial modeling for carbon credit verification frequencies - Live Version 1.0
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">Enhanced Financial Modeling</div>
                    <div className="text-sm text-blue-700">NPV, ROI, and cash flow projections</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">Verification Frequency Optimization</div>
                    <div className="text-sm text-green-700">Monthly, quarterly, semi-annual, annual</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">Working Capital Analysis</div>
                    <div className="text-sm text-purple-700">Debt requirements and financing costs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About This Tool */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div>
                  <strong>Based on Isometric's Monthly Verification Model</strong>
                  <br />
                  This enhanced calculator builds upon Isometric's research showing that monthly verification
                  can provide significant working capital savings compared to traditional annual verification.
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Enhanced with climate risk integration
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calculator className="w-3 h-3" />
                      Project-type-specific defaults
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://isometric.com/monthly-verifications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Original
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Calculator Component */}
        <VerificationCalculator
          onSaveModel={handleSaveModel}
          className="mb-8"
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              Carbon Verification Calculator • Enhanced for ChatPDD Platform
            </p>
            <p>
              Financial modeling based on{" "}
              <a
                href="https://isometric.com/monthly-verifications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Isometric's Monthly Verification Research
              </a>
              {" "}with additional climate risk and project management features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

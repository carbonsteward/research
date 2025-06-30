'use client'

/**
 * Enhanced Carbon Verification Calculator
 * Interactive financial modeling component based on Isometric's monthly verification system
 * Integrates with ChatPDD's existing design system and features
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Save,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  Settings,
  Lightbulb
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts'

interface VerificationInputs {
  projectName: string
  projectType: 'biochar' | 'reforestation' | 'soil_carbon' | 'dac' | 'beccs' | 'other'
  annualTonnes: number
  pricePerTonne: number
  variableCostPerTonne: number
  annualFixedCosts: number
  costOfFinancing: number
  verificationFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  projectStartDate: Date
  projectDuration: number
  carbonPriceGrowth?: number
  operationalRamp?: number[]
  seasonalityFactors?: number[]
  discountRate?: number
}

interface VerificationCalculatorProps {
  className?: string
  onSaveModel?: (model: any) => void
  defaultInputs?: Partial<VerificationInputs>
}

export function VerificationCalculator({ className, onSaveModel, defaultInputs }: VerificationCalculatorProps) {
  // State management
  const [inputs, setInputs] = useState<VerificationInputs>({
    projectName: '',
    projectType: 'biochar',
    annualTonnes: 10000,
    pricePerTonne: 100,
    variableCostPerTonne: 70,
    annualFixedCosts: 200000,
    costOfFinancing: 0.15,
    verificationFrequency: 'monthly',
    projectStartDate: new Date(),
    projectDuration: 10,
    carbonPriceGrowth: 0.03,
    discountRate: 0.12,
    ...defaultInputs
  })

  const [model, setModel] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState('inputs')

  // Load project type defaults
  useEffect(() => {
    if (inputs.projectType) {
      loadProjectDefaults(inputs.projectType)
    }
  }, [inputs.projectType])

  const loadProjectDefaults = async (projectType: string) => {
    try {
      const response = await fetch(`/api/carbon-verification/calculate/defaults?projectType=${projectType}`)
      const data = await response.json()

      if (data.success) {
        setInputs(prev => ({
          ...prev,
          ...data.data,
          projectName: prev.projectName,
          projectType: prev.projectType
        }))
      }
    } catch (error) {
      console.error('Failed to load defaults:', error)
    }
  }

  // Calculate financial model
  const calculateModel = async () => {
    if (!inputs.projectName.trim()) {
      setError('Please enter a project name')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const response = await fetch('/api/carbon-verification/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inputs,
          projectStartDate: inputs.projectStartDate.toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Calculation failed')
      }

      setModel(data.data)
      setActiveTab('results')

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsCalculating(false)
    }
  }

  // Save model
  const saveModel = async () => {
    if (!model) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/carbon-verification/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          description: `${inputs.projectName} - ${inputs.projectType} verification model`
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSaveModel?.(data.data)
      } else {
        throw new Error(data.message || 'Save failed')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save model')
    } finally {
      setIsSaving(false)
    }
  }

  // Project type options with icons
  const projectTypeOptions = [
    { value: 'biochar', label: 'Biochar', icon: '🔥', description: 'Biomass pyrolysis carbon removal' },
    { value: 'reforestation', label: 'Reforestation', icon: '🌳', description: 'Tree planting and forest restoration' },
    { value: 'soil_carbon', label: 'Soil Carbon', icon: '🌱', description: 'Agricultural soil carbon sequestration' },
    { value: 'dac', label: 'Direct Air Capture', icon: '🏭', description: 'Mechanical atmospheric CO2 removal' },
    { value: 'beccs', label: 'BECCS', icon: '⚡', description: 'Bioenergy with carbon capture' },
    { value: 'other', label: 'Other', icon: '🔬', description: 'Other carbon removal technologies' }
  ]

  // Prepare chart data
  const cashFlowData = useMemo(() => {
    if (!model?.monthlyProjections) return []

    return model.monthlyProjections.slice(0, 24).map((projection: any) => ({
      month: projection.period,
      revenue: projection.revenueRecognized,
      costs: projection.totalCosts,
      cumulativeCash: projection.cumulativeCash,
      operatingIncome: projection.operatingIncome
    }))
  }, [model])

  const verificationComparisonData = useMemo(() => {
    if (!model?.comparison?.scenarios) return []

    return Object.entries(model.comparison.scenarios).map(([frequency, scenario]: [string, any]) => ({
      frequency,
      workingCapitalSavings: scenario.workingCapitalSavings,
      totalFinancingCosts: scenario.totalFinancingCosts,
      breakEvenMonth: scenario.breakEvenMonth,
      maxDebtRequired: scenario.maxDebtRequired
    }))
  }, [model])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Enhanced Carbon Verification Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Calculate the financial impact of different verification frequencies on your carbon project.
            Based on Isometric's monthly verification model with enhanced features.
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inputs">Project Inputs</TabsTrigger>
          <TabsTrigger value="results" disabled={!model}>Financial Model</TabsTrigger>
          <TabsTrigger value="comparison" disabled={!model}>Verification Comparison</TabsTrigger>
          <TabsTrigger value="insights" disabled={!model}>Insights & Risk</TabsTrigger>
        </TabsList>

        {/* Project Inputs Tab */}
        <TabsContent value="inputs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={inputs.projectName}
                    onChange={(e) => setInputs(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="e.g., Forest Carbon Sequestration Project"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select
                    value={inputs.projectType}
                    onValueChange={(value: any) => setInputs(prev => ({ ...prev, projectType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectDuration">Duration (Years)</Label>
                    <Input
                      id="projectDuration"
                      type="number"
                      value={inputs.projectDuration}
                      onChange={(e) => setInputs(prev => ({ ...prev, projectDuration: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectStartDate">Start Date</Label>
                    <Input
                      id="projectStartDate"
                      type="date"
                      value={inputs.projectStartDate.toISOString().split('T')[0]}
                      onChange={(e) => setInputs(prev => ({ ...prev, projectStartDate: new Date(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Production & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="annualTonnes">Annual Production (tonnes CO2e)</Label>
                  <Input
                    id="annualTonnes"
                    type="number"
                    value={inputs.annualTonnes}
                    onChange={(e) => setInputs(prev => ({ ...prev, annualTonnes: parseFloat(e.target.value) || 0 }))}
                    min="1"
                  />
                  <p className="text-xs text-gray-500">
                    Total tonnes of CO2 equivalent removed annually
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerTonne">Price per Tonne (USD)</Label>
                  <Input
                    id="pricePerTonne"
                    type="number"
                    value={inputs.pricePerTonne}
                    onChange={(e) => setInputs(prev => ({ ...prev, pricePerTonne: parseFloat(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbonPriceGrowth">Carbon Price Growth (%/year)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[(inputs.carbonPriceGrowth || 0) * 100]}
                      onValueChange={(value) => setInputs(prev => ({ ...prev, carbonPriceGrowth: value[0] / 100 }))}
                      max={20}
                      min={-10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">
                      {((inputs.carbonPriceGrowth || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    Annual Revenue: ${(inputs.annualTonnes * inputs.pricePerTonne).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variableCostPerTonne">Variable Cost per Tonne (USD)</Label>
                  <Input
                    id="variableCostPerTonne"
                    type="number"
                    value={inputs.variableCostPerTonne}
                    onChange={(e) => setInputs(prev => ({ ...prev, variableCostPerTonne: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualFixedCosts">Annual Fixed Costs (USD)</Label>
                  <Input
                    id="annualFixedCosts"
                    type="number"
                    value={inputs.annualFixedCosts}
                    onChange={(e) => setInputs(prev => ({ ...prev, annualFixedCosts: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-green-900 mb-1">Operating Margin</div>
                    <div className="text-green-700">
                      {(((inputs.annualTonnes * (inputs.pricePerTonne - inputs.variableCostPerTonne)) - inputs.annualFixedCosts) / (inputs.annualTonnes * inputs.pricePerTonne) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification & Financing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification & Financing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification Frequency</Label>
                  <Select
                    value={inputs.verificationFrequency}
                    onValueChange={(value: any) => setInputs(prev => ({ ...prev, verificationFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly - Maximum cash flow</SelectItem>
                      <SelectItem value="quarterly">Quarterly - Balanced approach</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual - Reduced verification costs</SelectItem>
                      <SelectItem value="annual">Annual - Traditional approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costOfFinancing">Cost of Financing (%/year)</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[inputs.costOfFinancing * 100]}
                      onValueChange={(value) => setInputs(prev => ({ ...prev, costOfFinancing: value[0] / 100 }))}
                      max={30}
                      min={0}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">
                      {(inputs.costOfFinancing * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showAdvanced">Advanced Parameters</Label>
                  <Switch
                    id="showAdvanced"
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                </div>

                {showAdvanced && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="discountRate">Discount Rate (%/year)</Label>
                      <Input
                        id="discountRate"
                        type="number"
                        value={(inputs.discountRate || 0.12) * 100}
                        onChange={(e) => setInputs(prev => ({ ...prev, discountRate: parseFloat(e.target.value) / 100 || 0.12 }))}
                        min="0"
                        max="30"
                        step="0.5"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={calculateModel}
              disabled={isCalculating || !inputs.projectName.trim()}
              size="lg"
              className="min-w-48"
            >
              {isCalculating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              Calculate Financial Model
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Error:</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
        </TabsContent>

        {/* Financial Model Results */}
        <TabsContent value="results" className="space-y-4">
          {model && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${model.totalProjectRevenue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div className="text-sm font-medium text-gray-600">Project ROI</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(model.projectROI * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <div className="text-sm font-medium text-gray-600">Payback Period</div>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {model.paybackPeriod} months
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <div className="text-sm font-medium text-gray-600">Recommended</div>
                    </div>
                    <div className="text-lg font-bold text-purple-600 capitalize">
                      {model.comparison.recommendedFrequency}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Monthly Cash Flow Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: any, name: string) => [
                          `$${value.toLocaleString()}`,
                          name === 'revenue' ? 'Revenue Recognized' :
                          name === 'costs' ? 'Total Costs' :
                          name === 'cumulativeCash' ? 'Cumulative Cash' :
                          'Operating Income'
                        ]} />
                        <Area type="monotone" dataKey="cumulativeCash" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="revenue" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="costs" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={saveModel} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Model
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Verification Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {model && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Verification Frequency Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={verificationComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="frequency" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`]} />
                        <Bar dataKey="workingCapitalSavings" fill="#10b981" name="Working Capital Savings" />
                        <Bar dataKey="totalFinancingCosts" fill="#ef4444" name="Total Financing Costs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(model.comparison.scenarios).map(([frequency, scenario]: [string, any]) => (
                  <Card
                    key={frequency}
                    className={frequency === model.comparison.recommendedFrequency ? 'ring-2 ring-green-500' : ''}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{frequency} Verification</span>
                        {frequency === model.comparison.recommendedFrequency && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Working Capital Savings</div>
                          <div className="font-semibold">${scenario.workingCapitalSavings.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Break-even Month</div>
                          <div className="font-semibold">{scenario.breakEvenMonth}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Max Debt Required</div>
                          <div className="font-semibold">${scenario.maxDebtRequired.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total NPV</div>
                          <div className="font-semibold">${scenario.totalNPV.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Insights & Risk Tab */}
        <TabsContent value="insights" className="space-y-4">
          {model && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {model.comparison.keyInsights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-blue-900">{insight}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {model.comparison.riskFactors.map((risk: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-yellow-900">{risk}</div>
                      </div>
                    ))}

                    {model.climateRiskScore && (
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-orange-900">Climate Risk Score</div>
                          <div className="text-orange-700">
                            {(model.climateRiskScore * 100).toFixed(0)}% - {
                              model.climateRiskScore < 0.3 ? 'Low Risk' :
                              model.climateRiskScore < 0.6 ? 'Moderate Risk' :
                              'High Risk'
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

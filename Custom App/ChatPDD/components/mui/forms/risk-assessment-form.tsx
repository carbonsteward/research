'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Stack,
  Slider,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  Autocomplete,
  Rating,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Warning,
  CheckCircle,
  Error,
  Info,
  TrendingUp,
  TrendingDown,
  Assessment,
  Security,
  Schedule,
  AttachMoney,
  Park,
  Group,
  Add,
  Remove,
  Help,
  Visibility,
  Edit,
  Save,
  Download,
  Share,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Risk assessment validation schema
const riskAssessmentSchema = z.object({
  // Project basic info
  projectId: z.string().optional(),
  assessmentDate: z.date(),
  assessor: z.object({
    name: z.string().min(1, 'Assessor name required'),
    role: z.string().min(1, 'Role required'),
    certification: z.string().optional(),
  }),

  // Technical risks
  technical: z.object({
    technologyMaturity: z.number().min(1).max(5),
    implementationComplexity: z.number().min(1).max(5),
    scalabilityRisk: z.number().min(1).max(5),
    monitoringChallenges: z.number().min(1).max(5),
    dataQuality: z.number().min(1).max(5),
    mitigationMeasures: z.string().min(20, 'Mitigation measures required'),
  }),

  // Financial risks
  financial: z.object({
    capitalRequirements: z.number().min(1).max(5),
    marketPriceVolatility: z.number().min(1).max(5),
    revenueStability: z.number().min(1).max(5),
    operationalCosts: z.number().min(1).max(5),
    currencyRisk: z.number().min(1).max(5),
    mitigationMeasures: z.string().min(20, 'Mitigation measures required'),
  }),

  // Regulatory risks
  regulatory: z.object({
    policyStability: z.number().min(1).max(5),
    complianceComplexity: z.number().min(1).max(5),
    permittingRisk: z.number().min(1).max(5),
    standardChanges: z.number().min(1).max(5),
    jurisdictionalRisk: z.number().min(1).max(5),
    mitigationMeasures: z.string().min(20, 'Mitigation measures required'),
  }),

  // Environmental risks
  environmental: z.object({
    climateImpacts: z.number().min(1).max(5),
    biodiversityRisk: z.number().min(1).max(5),
    reversalRisk: z.number().min(1).max(5),
    leakageRisk: z.number().min(1).max(5),
    seasonalVariability: z.number().min(1).max(5),
    mitigationMeasures: z.string().min(20, 'Mitigation measures required'),
  }),

  // Social risks
  social: z.object({
    communityAcceptance: z.number().min(1).max(5),
    stakeholderConflicts: z.number().min(1).max(5),
    landRights: z.number().min(1).max(5),
    culturalSensitivity: z.number().min(1).max(5),
    employmentImpacts: z.number().min(1).max(5),
    mitigationMeasures: z.string().min(20, 'Mitigation measures required'),
  }),

  // Risk scenarios
  scenarios: z.array(z.object({
    name: z.string().min(1, 'Scenario name required'),
    description: z.string().min(20, 'Description required'),
    probability: z.number().min(0).max(100),
    impact: z.number().min(1).max(5),
    mitigationCost: z.number().min(0),
    timeToResolve: z.number().min(1), // days
  })),

  // Overall assessment
  overallRisk: z.object({
    level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    confidence: z.number().min(1).max(5),
    keyRiskFactors: z.array(z.string()).min(1, 'At least one key risk factor required'),
    recommendations: z.string().min(50, 'Detailed recommendations required'),
    monitoringPlan: z.string().min(30, 'Monitoring plan required'),
  }),

  // Insurance and contingency
  contingency: z.object({
    bufferPercentage: z.number().min(0).max(50),
    insuranceRequired: z.boolean(),
    emergencyFunding: z.number().min(0),
    contingencyTriggers: z.array(z.string()),
  }),
})

type RiskAssessmentData = z.infer<typeof riskAssessmentSchema>

const riskCategories = [
  { key: 'technical', label: 'Technical Risks', icon: <Assessment />, color: '#3b82f6' },
  { key: 'financial', label: 'Financial Risks', icon: <AttachMoney />, color: '#f59e0b' },
  { key: 'regulatory', label: 'Regulatory Risks', icon: <Security />, color: '#8b5cf6' },
  { key: 'environmental', label: 'Environmental Risks', icon: <Park />, color: '#10b981' },
  { key: 'social', label: 'Social Risks', icon: <Group />, color: '#ef4444' },
]

const riskLevels = [
  { value: 1, label: 'Very Low', color: '#22c55e', description: 'Minimal risk, standard monitoring' },
  { value: 2, label: 'Low', color: '#84cc16', description: 'Minor risk, routine management' },
  { value: 3, label: 'Medium', color: '#f59e0b', description: 'Moderate risk, active management required' },
  { value: 4, label: 'High', color: '#f97316', description: 'Significant risk, intensive management needed' },
  { value: 5, label: 'Critical', color: '#ef4444', description: 'Severe risk, immediate action required' },
]

const riskFactorOptions = [
  'Technology immaturity', 'Market volatility', 'Regulatory uncertainty',
  'Climate change impacts', 'Community resistance', 'Funding gaps',
  'Monitoring complexity', 'Permanence concerns', 'Leakage potential',
  'Standard changes', 'Political instability', 'Currency fluctuation'
]

interface RiskAssessmentFormProps {
  onSubmit: (data: RiskAssessmentData) => void
  initialData?: Partial<RiskAssessmentData>
  projectData?: {
    name: string
    type: string
    location: string
  }
  isLoading?: boolean
}

export function RiskAssessmentForm({
  onSubmit,
  initialData,
  projectData,
  isLoading = false
}: RiskAssessmentFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid, isSubmitting }
  } = useForm<RiskAssessmentData>({
    resolver: zodResolver(riskAssessmentSchema),
    defaultValues: {
      assessmentDate: new Date(),
      assessor: { name: '', role: '', certification: '' },
      technical: {
        technologyMaturity: 3,
        implementationComplexity: 3,
        scalabilityRisk: 3,
        monitoringChallenges: 3,
        dataQuality: 3,
        mitigationMeasures: '',
      },
      financial: {
        capitalRequirements: 3,
        marketPriceVolatility: 3,
        revenueStability: 3,
        operationalCosts: 3,
        currencyRisk: 3,
        mitigationMeasures: '',
      },
      regulatory: {
        policyStability: 3,
        complianceComplexity: 3,
        permittingRisk: 3,
        standardChanges: 3,
        jurisdictionalRisk: 3,
        mitigationMeasures: '',
      },
      environmental: {
        climateImpacts: 3,
        biodiversityRisk: 3,
        reversalRisk: 3,
        leakageRisk: 3,
        seasonalVariability: 3,
        mitigationMeasures: '',
      },
      social: {
        communityAcceptance: 3,
        stakeholderConflicts: 3,
        landRights: 3,
        culturalSensitivity: 3,
        employmentImpacts: 3,
        mitigationMeasures: '',
      },
      scenarios: [],
      overallRisk: {
        level: 'MEDIUM',
        confidence: 3,
        keyRiskFactors: [],
        recommendations: '',
        monitoringPlan: '',
      },
      contingency: {
        bufferPercentage: 10,
        insuranceRequired: false,
        emergencyFunding: 0,
        contingencyTriggers: [],
      },
      ...initialData,
    },
    mode: 'onChange',
  })

  const { fields: scenarioFields, append: appendScenario, remove: removeScenario } = useFieldArray({
    control,
    name: 'scenarios',
  })

  const watchedData = watch()

  // Calculate overall risk score
  const calculateOverallRiskScore = (): number => {
    const categories = ['technical', 'financial', 'regulatory', 'environmental', 'social']
    let totalScore = 0
    let factorCount = 0

    categories.forEach(category => {
      const categoryData = watchedData[category as keyof typeof watchedData] as any
      if (categoryData && typeof categoryData === 'object') {
        Object.keys(categoryData).forEach(key => {
          if (typeof categoryData[key] === 'number' && key !== 'mitigationMeasures') {
            totalScore += categoryData[key]
            factorCount++
          }
        })
      }
    })

    return factorCount > 0 ? totalScore / factorCount : 3
  }

  const overallRiskScore = calculateOverallRiskScore()

  // Auto-update overall risk level based on score
  useEffect(() => {
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
    if (overallRiskScore <= 2) level = 'LOW'
    else if (overallRiskScore <= 3.5) level = 'MEDIUM'
    else if (overallRiskScore <= 4.5) level = 'HIGH'
    else level = 'CRITICAL'

    setValue('overallRisk.level', level)
  }, [overallRiskScore, setValue])

  const getRiskColor = (score: number): string => {
    const riskLevel = riskLevels.find(level => level.value === Math.round(score))
    return riskLevel?.color || '#6b7280'
  }

  const getRiskLabel = (score: number): string => {
    const riskLevel = riskLevels.find(level => level.value === Math.round(score))
    return riskLevel?.label || 'Unknown'
  }

  const renderRiskCategory = (category: any, categoryKey: string) => {
    const categoryConfig = riskCategories.find(cat => cat.key === categoryKey)
    if (!categoryConfig) return null

    const categoryData = watchedData[categoryKey as keyof typeof watchedData] as any
    const categoryScore = Object.keys(categoryData || {})
      .filter(key => key !== 'mitigationMeasures')
      .reduce((sum, key) => sum + (categoryData[key] || 0), 0) / 5

    return (
      <Card key={categoryKey} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: categoryConfig.color }}>
                {categoryConfig.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {categoryConfig.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Score: {categoryScore.toFixed(1)} - {getRiskLabel(categoryScore)}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LinearProgress
                variant="determinate"
                value={(categoryScore / 5) * 100}
                sx={{
                  width: 100,
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getRiskColor(categoryScore),
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={() => setExpandedCategory(
                  expandedCategory === categoryKey ? null : categoryKey
                )}
              >
                {expandedCategory === categoryKey ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
          </Box>

          <Collapse in={expandedCategory === categoryKey}>
            <Grid container spacing={2}>
              {Object.keys(categoryData || {}).map(factorKey => {
                if (factorKey === 'mitigationMeasures') return null

                return (
                  <Grid item xs={12} md={6} key={factorKey}>
                    <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                      {factorKey.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Controller
                      name={`${categoryKey}.${factorKey}` as any}
                      control={control}
                      render={({ field }) => (
                        <Box>
                          <Slider
                            {...field}
                            min={1}
                            max={5}
                            step={1}
                            marks={riskLevels.map(level => ({
                              value: level.value,
                              label: level.label,
                            }))}
                            valueLabelDisplay="auto"
                            sx={{
                              '& .MuiSlider-thumb': {
                                bgcolor: getRiskColor(field.value),
                              },
                              '& .MuiSlider-track': {
                                bgcolor: getRiskColor(field.value),
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {riskLevels.find(l => l.value === field.value)?.description}
                          </Typography>
                        </Box>
                      )}
                    />
                  </Grid>
                )
              })}

              <Grid item xs={12}>
                <Controller
                  name={`${categoryKey}.mitigationMeasures` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mitigation Measures"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors[categoryKey as keyof typeof errors]?.mitigationMeasures}
                      helperText={errors[categoryKey as keyof typeof errors]?.mitigationMeasures?.message as string}
                      placeholder="Describe specific measures to mitigate risks in this category..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    )
  }

  const renderScenarioAnalysis = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Risk Scenarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowScenarioDialog(true)}
        >
          Add Scenario
        </Button>
      </Box>

      {scenarioFields.length === 0 ? (
        <Alert severity="info">
          No risk scenarios defined. Add scenarios to better understand potential project risks.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Scenario</TableCell>
                <TableCell>Probability (%)</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>Mitigation Cost</TableCell>
                <TableCell>Time to Resolve</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarioFields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {watchedData.scenarios[index]?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {watchedData.scenarios[index]?.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{watchedData.scenarios[index]?.probability}%</TableCell>
                  <TableCell>
                    <Chip
                      label={getRiskLabel(watchedData.scenarios[index]?.impact || 1)}
                      size="small"
                      sx={{ bgcolor: getRiskColor(watchedData.scenarios[index]?.impact || 1), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>${(watchedData.scenarios[index]?.mitigationCost || 0).toLocaleString()}</TableCell>
                  <TableCell>{watchedData.scenarios[index]?.timeToResolve} days</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => removeScenario(index)}>
                      <Remove />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Scenario Dialog */}
      <Dialog open={showScenarioDialog} onClose={() => setShowScenarioDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Risk Scenario</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Scenario Name"
                fullWidth
                placeholder="e.g., Market Price Collapse"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                placeholder="Detailed description of the risk scenario..."
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Probability (%)"
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Impact Level</InputLabel>
                <Select defaultValue={3}>
                  {riskLevels.map(level => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mitigation Cost (USD)"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Time to Resolve (days)"
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScenarioDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              appendScenario({
                name: 'New Scenario',
                description: 'Description',
                probability: 20,
                impact: 3,
                mitigationCost: 0,
                timeToResolve: 30,
              })
              setShowScenarioDialog(false)
            }}
          >
            Add Scenario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

  const renderOverallAssessment = () => (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight="bold">
        Overall Risk Assessment
      </Typography>

      <Alert
        severity={
          overallRiskScore <= 2 ? 'success' :
          overallRiskScore <= 3.5 ? 'info' :
          overallRiskScore <= 4.5 ? 'warning' : 'error'
        }
      >
        <Typography variant="h6" gutterBottom>
          Overall Risk Score: {overallRiskScore.toFixed(1)} - {getRiskLabel(overallRiskScore)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(overallRiskScore / 5) * 100}
          sx={{
            height: 10,
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              bgcolor: getRiskColor(overallRiskScore),
            },
          }}
        />
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="overallRisk.confidence"
            control={control}
            render={({ field }) => (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Assessment Confidence Level
                </Typography>
                <Rating
                  {...field}
                  size="large"
                  precision={1}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  How confident are you in this risk assessment?
                </Typography>
              </Box>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="contingency.bufferPercentage"
            control={control}
            render={({ field }) => (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Recommended Buffer Percentage: {field.value}%
                </Typography>
                <Slider
                  {...field}
                  min={0}
                  max={50}
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>

      <Controller
        name="overallRisk.keyRiskFactors"
        control={control}
        render={({ field }) => (
          <Autocomplete
            {...field}
            multiple
            options={riskFactorOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Key Risk Factors"
                error={!!errors.overallRisk?.keyRiskFactors}
                helperText={errors.overallRisk?.keyRiskFactors?.message}
              />
            )}
            onChange={(_, value) => field.onChange(value)}
          />
        )}
      />

      <Controller
        name="overallRisk.recommendations"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Risk Management Recommendations"
            fullWidth
            multiline
            rows={4}
            error={!!errors.overallRisk?.recommendations}
            helperText={errors.overallRisk?.recommendations?.message}
            placeholder="Provide detailed recommendations for managing the identified risks..."
          />
        )}
      />

      <Controller
        name="overallRisk.monitoringPlan"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Risk Monitoring Plan"
            fullWidth
            multiline
            rows={3}
            error={!!errors.overallRisk?.monitoringPlan}
            helperText={errors.overallRisk?.monitoringPlan?.message}
            placeholder="Describe how risks will be monitored and managed throughout the project..."
          />
        )}
      />
    </Stack>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Risk Assessment
          </Typography>
          {projectData && (
            <Typography variant="body1" color="text.secondary" paragraph>
              Comprehensive risk assessment for {projectData.name} ({projectData.type}) in {projectData.location}
            </Typography>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Assessor Information */}
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assessor Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="assessor.name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Assessor Name"
                          fullWidth
                          error={!!errors.assessor?.name}
                          helperText={errors.assessor?.name?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="assessor.role"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Role/Title"
                          fullWidth
                          error={!!errors.assessor?.role}
                          helperText={errors.assessor?.role?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="assessor.certification"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Certification (Optional)"
                          fullWidth
                          placeholder="e.g., CPA, PMP, Risk Management"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Risk Categories */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Risk Categories Assessment
            </Typography>

            {riskCategories.map(category =>
              renderRiskCategory(category, category.key)
            )}

            {/* Scenario Analysis */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                {renderScenarioAnalysis()}
              </CardContent>
            </Card>

            {/* Overall Assessment */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                {renderOverallAssessment()}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<Save />}>
                  Save Draft
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export PDF
                </Button>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!isValid || isSubmitting || isLoading}
                startIcon={isSubmitting || isLoading ? <LinearProgress /> : <CheckCircle />}
              >
                {isSubmitting || isLoading ? 'Submitting...' : 'Complete Assessment'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RiskAssessmentForm

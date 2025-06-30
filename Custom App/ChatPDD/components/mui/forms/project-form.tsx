'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
  Slider,
  Rating,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  Collapse,
} from '@mui/material'
import {
  DatePicker,
  DateTimePicker,
} from '@mui/x-date-pickers'
import {
  Add,
  Remove,
  CloudUpload,
  LocationOn,
  Schedule,
  Assessment,
  Park,
  AttachMoney,
  Group,
  Security,
  Info,
  CheckCircle,
  Warning,
  Error,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schema
const projectSchema = z.object({
  // Basic Information
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['AFOLU', 'ENERGY', 'WASTE', 'TRANSPORT', 'MANUFACTURING', 'BUILDINGS']),
  
  // Location
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  
  // Methodology
  methodology: z.object({
    standard: z.string().min(1, 'Standard is required'),
    version: z.string().min(1, 'Version is required'),
    id: z.string().min(1, 'Methodology ID is required'),
  }),
  
  // Timeline
  timeline: z.object({
    startDate: z.date(),
    endDate: z.date(),
    creditingPeriod: z.number().min(1).max(50),
  }).refine(data => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  }),
  
  // Financial
  financial: z.object({
    totalBudget: z.number().min(1000, 'Budget must be at least $1,000'),
    expectedRevenue: z.number().min(0),
    costPerCredit: z.number().min(0.1),
    investmentStage: z.enum(['SEED', 'SERIES_A', 'SERIES_B', 'BRIDGE', 'DEBT']),
  }),
  
  // Credits
  credits: z.object({
    estimatedAnnual: z.number().min(100, 'Must estimate at least 100 credits annually'),
    totalEstimated: z.number().min(500, 'Must estimate at least 500 total credits'),
    pricePerCredit: z.number().min(1),
    vintage: z.number().min(2020).max(2050),
  }),
  
  // Team
  team: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    email: z.string().email('Invalid email'),
    expertise: z.array(z.string()).min(1, 'At least one expertise required'),
  })).min(1, 'At least one team member required'),
  
  // Risk Assessment
  risks: z.object({
    technical: z.number().min(1).max(5),
    financial: z.number().min(1).max(5),
    regulatory: z.number().min(1).max(5),
    environmental: z.number().min(1).max(5),
    mitigation: z.string().min(10, 'Risk mitigation plan required'),
  }),
  
  // Documents
  documents: z.array(z.string()).optional(),
  
  // Additional Options
  isPublic: z.boolean(),
  allowInvestors: z.boolean(),
  sustainabilityGoals: z.array(z.string()),
})

type ProjectFormData = z.infer<typeof projectSchema>

const steps = [
  'Basic Information',
  'Location & Methodology', 
  'Timeline & Financial',
  'Team & Risk Assessment',
  'Review & Submit'
]

const projectTypes = [
  { value: 'AFOLU', label: 'Agriculture, Forestry and Other Land Use', icon: '🌳' },
  { value: 'ENERGY', label: 'Renewable Energy', icon: '⚡' },
  { value: 'WASTE', label: 'Waste Management', icon: '♻️' },
  { value: 'TRANSPORT', label: 'Transportation', icon: '🚊' },
  { value: 'MANUFACTURING', label: 'Manufacturing', icon: '🏭' },
  { value: 'BUILDINGS', label: 'Buildings & Construction', icon: '🏢' },
]

const countries = [
  'United States', 'Brazil', 'India', 'China', 'Germany', 'Canada', 'Australia',
  'Kenya', 'Costa Rica', 'Peru', 'Indonesia', 'Philippines', 'Mexico'
]

const methodologyStandards = [
  'Verra VCS', 'Gold Standard', 'CDM', 'Climate Action Reserve', 'American Carbon Registry'
]

const expertiseAreas = [
  'Project Development', 'Carbon Accounting', 'Environmental Science', 'Finance',
  'Legal & Compliance', 'Engineering', 'Community Engagement', 'Monitoring & Evaluation'
]

const sustainabilityGoals = [
  'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education', 'Gender Equality',
  'Clean Water', 'Affordable Energy', 'Economic Growth', 'Innovation', 'Reduced Inequalities',
  'Sustainable Cities', 'Responsible Consumption', 'Climate Action', 'Life Below Water',
  'Life on Land', 'Peace & Justice', 'Partnerships'
]

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void
  initialData?: Partial<ProjectFormData>
  isLoading?: boolean
}

export function ProjectForm({ onSubmit, initialData, isLoading = false }: ProjectFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      isPublic: true,
      allowInvestors: true,
      sustainabilityGoals: [],
      team: [{ name: '', role: '', email: '', expertise: [] }],
      risks: {
        technical: 3,
        financial: 3,
        regulatory: 3,
        environmental: 3,
        mitigation: '',
      },
      ...initialData,
    },
    mode: 'onChange',
  })

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control,
    name: 'team',
  })

  const watchedType = watch('type')
  const watchedBudget = watch('financial.totalBudget')
  const watchedCredits = watch('credits.estimatedAnnual')

  const handleNext = async () => {
    const fieldsToValidate = getStepFields(activeStep)
    const isStepValid = await trigger(fieldsToValidate as any)
    
    if (isStepValid) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const getStepFields = (step: number): (keyof ProjectFormData)[] => {
    switch (step) {
      case 0: return ['name', 'description', 'type']
      case 1: return ['country', 'methodology']
      case 2: return ['timeline', 'financial', 'credits']
      case 3: return ['team', 'risks']
      case 4: return []
      default: return []
    }
  }

  const getRiskColor = (value: number) => {
    if (value <= 2) return 'success'
    if (value <= 3) return 'warning'
    return 'error'
  }

  const calculateProjectScore = () => {
    const budget = watchedBudget || 0
    const credits = watchedCredits || 0
    const teamSize = teamFields.length
    
    let score = 0
    if (budget > 100000) score += 25
    if (credits > 1000) score += 25
    if (teamSize >= 3) score += 25
    if (watchedType) score += 25
    
    return score
  }

  const renderBasicInformation = () => (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Basic Project Information
      </Typography>
      
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Project Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder="e.g., Amazon Rainforest Conservation Project"
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Project Description"
            fullWidth
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            placeholder="Provide a detailed description of your carbon project..."
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Project Type</InputLabel>
            <Select {...field} label="Project Type">
              {projectTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ fontSize: '1.2rem' }}>{type.icon}</Box>
                    <Typography>{type.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.type?.message}</FormHelperText>
          </FormControl>
        )}
      />

      <Box>
        <FormControlLabel
          control={
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
          }
          label="Make project publicly visible"
        />
        <Typography variant="body2" color="text.secondary">
          Public projects can be discovered by investors and partners
        </Typography>
      </Box>
    </Stack>
  )

  const renderLocationMethodology = () => (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Location & Methodology
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={countries}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
                onChange={(_, value) => field.onChange(value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Region/State (Optional)"
                fullWidth
                placeholder="e.g., California, Amazonas"
              />
            )}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Methodology Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="methodology.standard"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.methodology?.standard}>
                <InputLabel>Carbon Standard</InputLabel>
                <Select {...field} label="Carbon Standard">
                  {methodologyStandards.map((standard) => (
                    <MenuItem key={standard} value={standard}>
                      {standard}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.methodology?.standard?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="methodology.version"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Version"
                fullWidth
                error={!!errors.methodology?.version}
                helperText={errors.methodology?.version?.message}
                placeholder="e.g., v4.0"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Controller
            name="methodology.id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Methodology ID"
                fullWidth
                error={!!errors.methodology?.id}
                helperText={errors.methodology?.id?.message}
                placeholder="e.g., VM0042"
              />
            )}
          />
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Location Settings
      </Button>

      <Collapse in={showAdvanced}>
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            GPS Coordinates (Optional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Controller
                name="coordinates.latitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Latitude"
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.000001 }}
                    placeholder="e.g., -3.4653"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="coordinates.longitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Longitude"
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.000001 }}
                    placeholder="e.g., -62.2159"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Stack>
  )

  const renderTimelineFinancial = () => (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Timeline & Financial Planning
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Controller
            name="timeline.startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Project Start Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.timeline?.startDate,
                    helperText: errors.timeline?.startDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="timeline.endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Project End Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.timeline?.endDate,
                    helperText: errors.timeline?.endDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="timeline.creditingPeriod"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Crediting Period (years)"
                fullWidth
                type="number"
                error={!!errors.timeline?.creditingPeriod}
                helperText={errors.timeline?.creditingPeriod?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Financial Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="financial.totalBudget"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total Budget (USD)"
                fullWidth
                type="number"
                error={!!errors.financial?.totalBudget}
                helperText={errors.financial?.totalBudget?.message}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="financial.expectedRevenue"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Expected Revenue (USD)"
                fullWidth
                type="number"
                error={!!errors.financial?.expectedRevenue}
                helperText={errors.financial?.expectedRevenue?.message}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Carbon Credits Estimation
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="credits.estimatedAnnual"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Estimated Annual Credits"
                fullWidth
                type="number"
                error={!!errors.credits?.estimatedAnnual}
                helperText={errors.credits?.estimatedAnnual?.message}
                InputProps={{
                  startAdornment: <Park sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="credits.pricePerCredit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Expected Price per Credit (USD)"
                fullWidth
                type="number"
                error={!!errors.credits?.pricePerCredit}
                helperText={errors.credits?.pricePerCredit?.message}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {watchedBudget && watchedCredits && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Project Economics:</strong> With {watchedCredits.toLocaleString()} annual credits 
            and a ${watchedBudget.toLocaleString()} budget, your cost per credit is approximately 
            ${((watchedBudget / (watchedCredits * 10)) || 0).toFixed(2)}
          </Typography>
        </Alert>
      )}
    </Stack>
  )

  const renderTeamRisk = () => (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        Team & Risk Assessment
      </Typography>

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1">Project Team</Typography>
          <Button
            startIcon={<Add />}
            onClick={() => appendTeam({ name: '', role: '', email: '', expertise: [] })}
            size="small"
          >
            Add Team Member
          </Button>
        </Box>

        {teamFields.map((field, index) => (
          <Card key={field.id} sx={{ mb: 2, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Controller
                  name={`team.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      size="small"
                      error={!!errors.team?.[index]?.name}
                      helperText={errors.team?.[index]?.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name={`team.${index}.role`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Role"
                      fullWidth
                      size="small"
                      error={!!errors.team?.[index]?.role}
                      helperText={errors.team?.[index]?.role?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name={`team.${index}.email`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      size="small"
                      type="email"
                      error={!!errors.team?.[index]?.email}
                      helperText={errors.team?.[index]?.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name={`team.${index}.expertise`}
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={expertiseAreas}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Expertise"
                          error={!!errors.team?.[index]?.expertise}
                        />
                      )}
                      onChange={(_, value) => field.onChange(value)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            variant="outlined"
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                {teamFields.length > 1 && (
                  <IconButton
                    onClick={() => removeTeam(index)}
                    color="error"
                    size="small"
                  >
                    <Remove />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Card>
        ))}
      </Box>

      <Divider />

      <Typography variant="subtitle1" gutterBottom>
        Risk Assessment
      </Typography>

      <Grid container spacing={3}>
        {[
          { key: 'technical', label: 'Technical Risk', icon: <Assessment /> },
          { key: 'financial', label: 'Financial Risk', icon: <AttachMoney /> },
          { key: 'regulatory', label: 'Regulatory Risk', icon: <Security /> },
          { key: 'environmental', label: 'Environmental Risk', icon: <Park /> },
        ].map(({ key, label, icon }) => (
          <Grid item xs={12} md={6} key={key}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                {icon}
                <Typography variant="body2">{label}</Typography>
              </Stack>
              <Controller
                name={`risks.${key as keyof typeof projectSchema.shape.risks.shape}`}
                control={control}
                render={({ field }) => (
                  <Box>
                    <Slider
                      {...field}
                      min={1}
                      max={5}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      color={getRiskColor(field.value) as any}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {field.value === 1 && 'Very Low Risk'}
                      {field.value === 2 && 'Low Risk'}
                      {field.value === 3 && 'Medium Risk'}
                      {field.value === 4 && 'High Risk'}
                      {field.value === 5 && 'Very High Risk'}
                    </Typography>
                  </Box>
                )}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Controller
        name="risks.mitigation"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Risk Mitigation Plan"
            fullWidth
            multiline
            rows={3}
            error={!!errors.risks?.mitigation}
            helperText={errors.risks?.mitigation?.message}
            placeholder="Describe your strategy for identifying, monitoring, and mitigating project risks..."
          />
        )}
      />
    </Stack>
  )

  const renderReviewSubmit = () => {
    const formData = watch()
    const projectScore = calculateProjectScore()

    return (
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Review & Submit
        </Typography>

        <Alert severity={projectScore >= 75 ? 'success' : projectScore >= 50 ? 'warning' : 'error'}>
          <Typography variant="subtitle2" gutterBottom>
            Project Readiness Score: {projectScore}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={projectScore} 
            color={projectScore >= 75 ? 'success' : projectScore >= 50 ? 'warning' : 'error'}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2">
            {projectScore >= 75 && 'Excellent! Your project is well-prepared for submission.'}
            {projectScore >= 50 && projectScore < 75 && 'Good progress. Consider adding more details to strengthen your submission.'}
            {projectScore < 50 && 'Your project needs more information before submission.'}
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Project Overview
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.name || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {formData.type || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {formData.country || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Team Size:</strong> {teamFields.length} members
                </Typography>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Financial Summary
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Budget:</strong> ${(formData.financial?.totalBudget || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Expected Revenue:</strong> ${(formData.financial?.expectedRevenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Annual Credits:</strong> {(formData.credits?.estimatedAnnual || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Price per Credit:</strong> ${formData.credits?.pricePerCredit || 0}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Controller
          name="sustainabilityGoals"
          control={control}
          render={({ field }) => (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                UN Sustainable Development Goals (Optional)
              </Typography>
              <Autocomplete
                {...field}
                multiple
                options={sustainabilityGoals}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select relevant SDGs..."
                    helperText="Choose the UN SDGs that your project contributes to"
                  />
                )}
                onChange={(_, value) => field.onChange(value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Box>
          )}
        />

        <FormControlLabel
          control={
            <Controller
              name="allowInvestors"
              control={control}
              render={({ field }) => (
                <Switch {...field} checked={field.value} />
              )}
            />
          }
          label="Allow investors to contact me about this project"
        />
      </Stack>
    )
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: return renderBasicInformation()
      case 1: return renderLocationMethodology()
      case 2: return renderTimelineFinancial()
      case 3: return renderTeamRisk()
      case 4: return renderReviewSubmit()
      default: return null
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Create New Carbon Project
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Complete the form below to register your carbon mitigation project and begin the certification process.
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting || isLoading}
                  startIcon={isSubmitting || isLoading ? <LinearProgress /> : <CheckCircle />}
                  size="large"
                >
                  {isSubmitting || isLoading ? 'Submitting...' : 'Submit Project'}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProjectForm
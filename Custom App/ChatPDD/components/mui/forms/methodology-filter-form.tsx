'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Slider,
  IconButton,
  Collapse,
  Alert,
  Divider,
  Paper,
  Grid,
  Switch,
  Rating,
  Avatar,
  Tooltip,
} from '@mui/material'
import {
  FilterList,
  Clear,
  Search,
  ExpandMore,
  ExpandLess,
  Tune,
  Bookmark,
  BookmarkBorder,
  Info,
  Star,
  StarBorder,
  TrendingUp,
  Park,
  Security,
  AttachMoney,
  Schedule,
  Language,
  Assessment,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schema for methodology filters
const methodologyFilterSchema = z.object({
  // Search and basic filters
  searchQuery: z.string(),
  standard: z.array(z.string()),
  sector: z.array(z.string()),
  geography: z.array(z.string()),

  // Advanced filters
  complexity: z.object({
    min: z.number().min(1).max(5),
    max: z.number().min(1).max(5),
  }),
  creditVolume: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  timeToMarket: z.number().min(1).max(60), // months

  // Compliance and certification
  itmoCompliant: z.boolean(),
  cdmEligible: z.boolean(),
  additionality: z.array(z.string()),

  // Financial and risk
  costRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  riskLevel: z.array(z.string()),

  // Project preferences
  projectSize: z.array(z.string()),
  implementationDifficulty: z.number().min(1).max(5),
  monitoringComplexity: z.number().min(1).max(5),

  // Advanced options
  includeSuperseded: z.boolean(),
  onlyRecentVersions: z.boolean(),
  favoriteOnly: z.boolean(),
  minRating: z.number().min(0).max(5),

  // Custom criteria
  customTags: z.array(z.string()),
  excludeKeywords: z.array(z.string()),
})

type MethodologyFilterData = z.infer<typeof methodologyFilterSchema>

const carbonStandards = [
  'Verra VCS', 'Gold Standard', 'CDM', 'Climate Action Reserve', 'American Carbon Registry',
  'Global Carbon Council', 'Social Carbon', 'Plan Vivo'
]

const sectors = [
  'AFOLU', 'Energy', 'Transport', 'Waste', 'Manufacturing', 'Buildings & Construction',
  'Chemical Industry', 'Metal Production', 'Mining', 'Oil & Gas', 'Other'
]

const geographies = [
  'Global', 'Developed Countries', 'Developing Countries', 'LDCs',
  'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'
]

const additionalityTypes = [
  'Investment Analysis', 'Barrier Analysis', 'Common Practice Analysis',
  'Previous Occurrence Analysis', 'Regulatory Surplus'
]

const riskLevels = ['Low', 'Medium', 'High', 'Very High']

const projectSizes = [
  'Micro (<1,000 tCO2e/year)',
  'Small (1,000-15,000 tCO2e/year)',
  'Medium (15,000-150,000 tCO2e/year)',
  'Large (>150,000 tCO2e/year)'
]

const customTagOptions = [
  'Nature-based', 'Technology-based', 'Community-focused', 'Indigenous-led',
  'Gender-inclusive', 'High-integrity', 'Jurisdictional', 'Nested'
]

interface MethodologyFilterFormProps {
  onFilterChange: (filters: MethodologyFilterData) => void
  initialFilters?: Partial<MethodologyFilterData>
  savedFilters?: Array<{ id: string; name: string; filters: MethodologyFilterData }>
  onSaveFilter?: (name: string, filters: MethodologyFilterData) => void
  resultCount?: number
}

export function MethodologyFilterForm({
  onFilterChange,
  initialFilters,
  savedFilters = [],
  onSaveFilter,
  resultCount
}: MethodologyFilterFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState('')

  const {
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty }
  } = useForm<MethodologyFilterData>({
    resolver: zodResolver(methodologyFilterSchema),
    defaultValues: {
      searchQuery: '',
      standard: [],
      sector: [],
      geography: [],
      complexity: { min: 1, max: 5 },
      creditVolume: { min: 0, max: 1000000 },
      timeToMarket: 24,
      itmoCompliant: false,
      cdmEligible: false,
      additionality: [],
      costRange: { min: 0, max: 100 },
      riskLevel: [],
      projectSize: [],
      implementationDifficulty: 3,
      monitoringComplexity: 3,
      includeSuperseded: false,
      onlyRecentVersions: true,
      favoriteOnly: false,
      minRating: 0,
      customTags: [],
      excludeKeywords: [],
      ...initialFilters,
    },
    mode: 'onChange',
  })

  const watchedFilters = watch()

  React.useEffect(() => {
    if (isDirty) {
      onFilterChange(watchedFilters)
    }
  }, [watchedFilters, isDirty, onFilterChange])

  const handleClearAll = () => {
    reset()
  }

  const handleApplySavedFilter = (filters: MethodologyFilterData) => {
    Object.entries(filters).forEach(([key, value]) => {
      setValue(key as keyof MethodologyFilterData, value as any)
    })
  }

  const handleSaveCurrentFilter = () => {
    if (saveFilterName && onSaveFilter) {
      onSaveFilter(saveFilterName, watchedFilters)
      setSaveFilterName('')
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (watchedFilters.searchQuery) count++
    if (watchedFilters.standard.length) count++
    if (watchedFilters.sector.length) count++
    if (watchedFilters.geography.length) count++
    if (watchedFilters.itmoCompliant) count++
    if (watchedFilters.cdmEligible) count++
    if (watchedFilters.additionality.length) count++
    if (watchedFilters.riskLevel.length) count++
    if (watchedFilters.projectSize.length) count++
    if (watchedFilters.favoriteOnly) count++
    if (watchedFilters.minRating > 0) count++
    if (watchedFilters.customTags.length) count++
    if (watchedFilters.excludeKeywords.length) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterList color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Methodology Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} active`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {resultCount !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {resultCount.toLocaleString()} results
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Advanced
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={handleClearAll}
              disabled={!isDirty}
            >
              Clear All
            </Button>
          </Stack>
        </Box>

        <Stack spacing={3}>
          {/* Main Search */}
          <Controller
            name="searchQuery"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Search methodologies by name, ID, or description..."
                fullWidth
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            )}
          />

          {/* Quick Filters */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Controller
                name="standard"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={carbonStandards}
                    renderInput={(params) => (
                      <TextField {...params} label="Carbon Standard" />
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
            <Grid item xs={12} md={4}>
              <Controller
                name="sector"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={sectors}
                    renderInput={(params) => (
                      <TextField {...params} label="Sector" />
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
            <Grid item xs={12} md={4}>
              <Controller
                name="geography"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={geographies}
                    renderInput={(params) => (
                      <TextField {...params} label="Geography" />
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
          </Grid>

          {/* Quick Toggle Filters */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Controller
              name="itmoCompliant"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="ITMO Compliant"
                />
              )}
            />
            <Controller
              name="cdmEligible"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="CDM Eligible"
                />
              )}
            />
            <Controller
              name="onlyRecentVersions"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Recent Versions Only"
                />
              )}
            />
            <Controller
              name="favoriteOnly"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Favorites Only"
                />
              )}
            />
          </Stack>

          {/* Advanced Filters */}
          <Collapse in={showAdvanced}>
            <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Advanced Filters
              </Typography>

              <Grid container spacing={3}>
                {/* Complexity & Difficulty */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Methodology Complexity
                  </Typography>
                  <Controller
                    name="complexity"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Slider
                          value={[field.value.min, field.value.max]}
                          onChange={(_, newValue) => {
                            const [min, max] = newValue as number[]
                            field.onChange({ min, max })
                          }}
                          valueLabelDisplay="auto"
                          min={1}
                          max={5}
                          marks={[
                            { value: 1, label: 'Simple' },
                            { value: 3, label: 'Medium' },
                            { value: 5, label: 'Complex' },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Implementation Difficulty
                  </Typography>
                  <Controller
                    name="implementationDifficulty"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Slider
                          {...field}
                          valueLabelDisplay="auto"
                          min={1}
                          max={5}
                          marks={[
                            { value: 1, label: 'Easy' },
                            { value: 3, label: 'Medium' },
                            { value: 5, label: 'Hard' },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Grid>

                {/* Credit Volume Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Expected Credit Volume (tCO2e/year)
                  </Typography>
                  <Controller
                    name="creditVolume"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Slider
                          value={[field.value.min, field.value.max]}
                          onChange={(_, newValue) => {
                            const [min, max] = newValue as number[]
                            field.onChange({ min, max })
                          }}
                          valueLabelDisplay="auto"
                          min={0}
                          max={1000000}
                          step={1000}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 100000, label: '100k' },
                            { value: 1000000, label: '1M' },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Grid>

                {/* Cost Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Implementation Cost (USD per tCO2e)
                  </Typography>
                  <Controller
                    name="costRange"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Slider
                          value={[field.value.min, field.value.max]}
                          onChange={(_, newValue) => {
                            const [min, max] = newValue as number[]
                            field.onChange({ min, max })
                          }}
                          valueLabelDisplay="auto"
                          min={0}
                          max={100}
                          marks={[
                            { value: 0, label: '$0' },
                            { value: 50, label: '$50' },
                            { value: 100, label: '$100+' },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Grid>

                {/* Project Size */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="projectSize"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={projectSizes}
                        renderInput={(params) => (
                          <TextField {...params} label="Project Size" />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                      />
                    )}
                  />
                </Grid>

                {/* Risk Level */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="riskLevel"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={riskLevels}
                        renderInput={(params) => (
                          <TextField {...params} label="Risk Level" />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                      />
                    )}
                  />
                </Grid>

                {/* Additionality */}
                <Grid item xs={12}>
                  <Controller
                    name="additionality"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={additionalityTypes}
                        renderInput={(params) => (
                          <TextField {...params} label="Additionality Requirements" />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                      />
                    )}
                  />
                </Grid>

                {/* Time to Market */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Maximum Time to Market (months)
                  </Typography>
                  <Controller
                    name="timeToMarket"
                    control={control}
                    render={({ field }) => (
                      <Slider
                        {...field}
                        valueLabelDisplay="auto"
                        min={1}
                        max={60}
                        marks={[
                          { value: 6, label: '6 mo' },
                          { value: 24, label: '2 yr' },
                          { value: 60, label: '5 yr' },
                        ]}
                      />
                    )}
                  />
                </Grid>

                {/* Minimum Rating */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Minimum User Rating
                  </Typography>
                  <Controller
                    name="minRating"
                    control={control}
                    render={({ field }) => (
                      <Rating
                        {...field}
                        size="large"
                        precision={0.5}
                      />
                    )}
                  />
                </Grid>

                {/* Custom Tags */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="customTags"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={customTagOptions}
                        freeSolo
                        renderInput={(params) => (
                          <TextField {...params} label="Custom Tags" />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                      />
                    )}
                  />
                </Grid>

                {/* Exclude Keywords */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="excludeKeywords"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        freeSolo
                        options={[]}
                        renderInput={(params) => (
                          <TextField {...params} label="Exclude Keywords" />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Collapse>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={showSavedFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowSavedFilters(!showSavedFilters)}
              >
                Saved Filters ({savedFilters.length})
              </Button>
              <Collapse in={showSavedFilters}>
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {savedFilters.map((saved) => (
                      <Chip
                        key={saved.id}
                        label={saved.name}
                        onClick={() => handleApplySavedFilter(saved.filters)}
                        variant="outlined"
                        icon={<Bookmark />}
                      />
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Save Current Filter */}
          {onSaveFilter && isDirty && (
            <Alert severity="info">
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Filter name..."
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSaveCurrentFilter}
                  disabled={!saveFilterName}
                >
                  Save Filter
                </Button>
              </Stack>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MethodologyFilterForm

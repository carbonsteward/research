'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Stack,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Assignment,
  FilterList,
  Security,
  Code,
  Preview,
  CheckCircle,
} from '@mui/icons-material'
import { MUIProvider } from '@/components/providers/mui-provider'
import { ProjectForm } from '@/components/mui/forms/project-form'
import { MethodologyFilterForm } from '@/components/mui/forms/methodology-filter-form'
import { RiskAssessmentForm } from '@/components/mui/forms/risk-assessment-form'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const formDemos = [
  {
    id: 'project-form',
    label: 'Project Creation Form',
    icon: <Assignment />,
    description: 'Multi-step form for creating carbon mitigation projects with comprehensive validation',
    features: [
      'Multi-step wizard interface',
      'Comprehensive field validation with Zod',
      'Dynamic form sections and conditional fields',
      'Team member management',
      'Risk assessment sliders',
      'File upload capabilities',
      'Progress tracking and auto-save',
      'Responsive design for all devices'
    ]
  },
  {
    id: 'methodology-filter',
    label: 'Methodology Filter Form',
    icon: <FilterList />,
    description: 'Advanced filtering system for carbon methodologies with real-time search',
    features: [
      'Real-time search with debouncing',
      'Multi-criteria filtering system',
      'Saved filter management',
      'Advanced filter collapsing',
      'Tag-based filtering',
      'Custom range sliders',
      'Auto-complete fields',
      'Export filter configurations'
    ]
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment Form',
    icon: <Security />,
    description: 'Comprehensive risk assessment tool with scenario analysis and automated scoring',
    features: [
      'Multi-category risk assessment',
      'Automated risk scoring algorithm',
      'Scenario planning and analysis',
      'Interactive risk visualizations',
      'Confidence rating system',
      'Mitigation planning tools',
      'Risk monitoring frameworks',
      'PDF export capabilities'
    ]
  }
]

export default function FormsDemo() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [submissions, setSubmissions] = useState<Array<{ form: string; data: any; timestamp: Date }>>([])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleFormSubmit = (formType: string) => (data: any) => {
    console.log(`${formType} form submitted:`, data)
    setSubmissions(prev => [...prev, { 
      form: formType, 
      data, 
      timestamp: new Date() 
    }])
    alert(`${formType} form submitted successfully! Check console for data.`)
  }

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  return (
    <MUIProvider>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Advanced MUI Forms Demo
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Comprehensive demonstration of Material-UI form components with advanced validation, 
            multi-step workflows, and real-time interactions for carbon project management.
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item>
              <Chip 
                icon={<Code />} 
                label="React Hook Form" 
                variant="outlined" 
                color="primary" 
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<CheckCircle />} 
                label="Zod Validation" 
                variant="outlined" 
                color="success" 
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<Preview />} 
                label="Material-UI v6" 
                variant="outlined" 
                color="secondary" 
              />
            </Grid>
          </Grid>

          {submissions.length > 0 && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recent Form Submissions: {submissions.length}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {submissions.slice(-3).map((submission, index) => (
                  <Chip
                    key={index}
                    label={`${submission.form} - ${submission.timestamp.toLocaleTimeString()}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Alert>
          )}
        </Box>

        {/* Form Overview Cards */}
        <Grid container spacing={3} mb={4}>
          {formDemos.map((demo, index) => (
            <Grid item xs={12} md={4} key={demo.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  border: selectedTab === index ? 2 : 1,
                  borderColor: selectedTab === index ? 'primary.main' : 'divider',
                }}
                onClick={() => setSelectedTab(index)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {demo.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {demo.label}
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {demo.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Key Features:
                  </Typography>
                  <Stack spacing={0.5}>
                    {demo.features.slice(0, 4).map((feature, idx) => (
                      <Typography key={idx} variant="caption" color="text.secondary">
                        • {feature}
                      </Typography>
                    ))}
                    {demo.features.length > 4 && (
                      <Typography variant="caption" color="primary">
                        +{demo.features.length - 4} more features
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Form Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            {formDemos.map((demo, index) => (
              <Tab
                key={demo.id}
                label={demo.label}
                icon={demo.icon}
                iconPosition="start"
                id={`form-tab-${index}`}
                aria-controls={`form-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Form Panels */}
        <TabPanel value={selectedTab} index={0}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Project Creation Form Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This multi-step form demonstrates comprehensive project creation with validation,
            team management, risk assessment, and financial planning.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <ProjectForm
            onSubmit={handleFormSubmit('Project Creation')}
            initialData={{
              name: 'Demo Amazon Conservation Project',
              type: 'AFOLU',
              isPublic: true,
            }}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Methodology Filter Form Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Advanced filtering system with real-time search, multi-criteria selection,
            and saved filter management for carbon methodologies.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <MethodologyFilterForm
            onFilterChange={handleFilterChange}
            resultCount={245}
            savedFilters={[
              {
                id: '1',
                name: 'AFOLU Projects - High Volume',
                filters: {
                  sector: ['AFOLU'],
                  creditVolume: { min: 50000, max: 1000000 },
                  standard: ['Verra VCS'],
                } as any
              },
              {
                id: '2', 
                name: 'Low Risk Energy Projects',
                filters: {
                  sector: ['Energy'],
                  riskLevel: ['Low'],
                  itmoCompliant: true,
                } as any
              }
            ]}
            onSaveFilter={(name, filters) => 
              console.log('Save filter:', { name, filters })
            }
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Risk Assessment Form Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Comprehensive risk assessment tool with automated scoring, scenario analysis,
            and detailed mitigation planning for carbon projects.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <RiskAssessmentForm
            onSubmit={handleFormSubmit('Risk Assessment')}
            projectData={{
              name: 'Demo Amazon Conservation Project',
              type: 'AFOLU',
              location: 'Brazil, Amazonas'
            }}
            initialData={{
              assessor: {
                name: 'Dr. Jane Smith',
                role: 'Senior Risk Analyst',
                certification: 'Certified Risk Management Professional'
              }
            }}
          />
        </TabPanel>

        {/* Footer */}
        <Box mt={6} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            These forms demonstrate the advanced capabilities of Material-UI with React Hook Form
            and Zod validation for comprehensive carbon project management workflows.
          </Typography>
        </Box>
      </Container>
    </MUIProvider>
  )
}
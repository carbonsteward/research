'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Fab,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Container,
  Stack,
  Divider,
  LinearProgress,
  Alert,
  AlertTitle,
  Skeleton,
} from '@mui/material'
import {
  TrendingUp,
  Park,
  AttachMoney,
  Security,
  Add,
  FilterList,
  Refresh,
  Download,
  LocationOn,
  CalendarToday,
  Group,
  Assessment,
  Timeline,
  Notifications,
  Settings,
  Dashboard,
  FolderOpen,
  Analytics,
  TrendingDown,
  Warning,
  CheckCircle,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Sample data types
interface Project {
  id: string
  name: string
  type: 'AFOLU' | 'ENERGY' | 'WASTE' | 'TRANSPORT' | 'MANUFACTURING' | 'BUILDINGS'
  status: 'PLANNING' | 'DESIGN' | 'VALIDATION' | 'IMPLEMENTATION' | 'MONITORING' | 'VERIFICATION' | 'COMPLETED'
  country: string
  region?: string
  methodology: {
    id: string
    name: string
    standard: string
  }
  timeline: {
    startDate: string
    endDate: string
    progress: number
  }
  credits: {
    estimated: number
    issued: number
    projected: number
  }
  financial: {
    budget: number
    spent: number
    revenue: number
    roi: number
  }
  risks: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    score: number
  }
  team: string[]
  lastUpdate: string
}

interface PortfolioMetrics {
  totalProjects: number
  activeProjects: number
  totalCredits: {
    estimated: number
    issued: number
    projected: number
  }
  totalRevenue: number
  totalInvestment: number
  averageROI: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  typeDistribution: Record<string, number>
  monthlyProgress: Array<{
    month: string
    credits: number
    revenue: number
    projects: number
  }>
}

// Portfolio metrics cards
const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary'
}: {
  title: string
  value: string | number
  subtitle: string
  icon: any
  trend?: { value: number; direction: 'up' | 'down' }
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color === 'primary' ? 'rgba(59, 130, 246, 0.05)' :
                                           color === 'success' ? 'rgba(34, 197, 94, 0.05)' :
                                           color === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                                           color === 'error' ? 'rgba(239, 68, 68, 0.05)' :
                                           'rgba(139, 69, 19, 0.05)'} 0%, rgba(255, 255, 255, 0.02) 100%)`,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend.direction === 'up' ? (
                <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDown color="error" sx={{ fontSize: 16, mr: 0.5 }} />
              )}
              <Typography
                variant="caption"
                color={trend.direction === 'up' ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 56,
            height: 56,
          }}
        >
          <Icon fontSize="large" />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
)

// Project status colors
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    PLANNING: '#6b7280',
    DESIGN: '#8b5cf6',
    VALIDATION: '#f59e0b',
    IMPLEMENTATION: '#3b82f6',
    MONITORING: '#10b981',
    VERIFICATION: '#059669',
    COMPLETED: '#374151',
  }
  return statusColors[status] || '#6b7280'
}

// Risk level colors
const getRiskColor = (level: string) => {
  const riskColors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  }
  return riskColors[level] || '#6b7280'
}

export function PortfolioDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview')

  // Load portfolio data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockProjects: Project[] = [
        {
          id: 'proj-001',
          name: 'Amazon Rainforest Conservation',
          type: 'AFOLU',
          status: 'IMPLEMENTATION',
          country: 'Brazil',
          region: 'Amazonas',
          methodology: {
            id: 'vcs-001',
            name: 'Afforestation and Reforestation',
            standard: 'Verra VCS'
          },
          timeline: {
            startDate: '2024-01-01',
            endDate: '2026-12-31',
            progress: 65
          },
          credits: {
            estimated: 150000,
            issued: 45000,
            projected: 105000
          },
          financial: {
            budget: 2500000,
            spent: 1200000,
            revenue: 675000,
            roi: 15.2
          },
          risks: {
            level: 'MEDIUM',
            score: 35
          },
          team: ['Maria Silva', 'Carlos Rodriguez', 'Ana Costa'],
          lastUpdate: '2024-03-15'
        },
        {
          id: 'proj-002',
          name: 'Solar Farm Initiative',
          type: 'ENERGY',
          status: 'MONITORING',
          country: 'USA',
          region: 'California',
          methodology: {
            id: 'cdm-002',
            name: 'Solar Power Generation',
            standard: 'CDM'
          },
          timeline: {
            startDate: '2023-06-01',
            endDate: '2025-05-31',
            progress: 85
          },
          credits: {
            estimated: 80000,
            issued: 68000,
            projected: 12000
          },
          financial: {
            budget: 1800000,
            spent: 1650000,
            revenue: 1360000,
            roi: 22.8
          },
          risks: {
            level: 'LOW',
            score: 15
          },
          team: ['John Smith', 'Sarah Johnson'],
          lastUpdate: '2024-03-10'
        },
        // Add more mock projects...
      ]

      const mockMetrics: PortfolioMetrics = {
        totalProjects: mockProjects.length,
        activeProjects: mockProjects.filter(p => p.status !== 'COMPLETED').length,
        totalCredits: {
          estimated: mockProjects.reduce((sum, p) => sum + p.credits.estimated, 0),
          issued: mockProjects.reduce((sum, p) => sum + p.credits.issued, 0),
          projected: mockProjects.reduce((sum, p) => sum + p.credits.projected, 0),
        },
        totalRevenue: mockProjects.reduce((sum, p) => sum + p.financial.revenue, 0),
        totalInvestment: mockProjects.reduce((sum, p) => sum + p.financial.spent, 0),
        averageROI: mockProjects.reduce((sum, p) => sum + p.financial.roi, 0) / mockProjects.length,
        riskDistribution: {
          low: mockProjects.filter(p => p.risks.level === 'LOW').length,
          medium: mockProjects.filter(p => p.risks.level === 'MEDIUM').length,
          high: mockProjects.filter(p => p.risks.level === 'HIGH').length,
          critical: mockProjects.filter(p => p.risks.level === 'CRITICAL').length,
        },
        typeDistribution: mockProjects.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        monthlyProgress: [
          { month: 'Jan', credits: 12000, revenue: 180000, projects: 2 },
          { month: 'Feb', credits: 19000, revenue: 285000, projects: 3 },
          { month: 'Mar', credits: 15000, revenue: 225000, projects: 2 },
          { month: 'Apr', credits: 22000, revenue: 330000, projects: 4 },
          { month: 'May', credits: 18000, revenue: 270000, projects: 3 },
          { month: 'Jun', credits: 25000, revenue: 375000, projects: 4 },
        ]
      }

      setProjects(mockProjects)
      setMetrics(mockMetrics)
      setLoading(false)
    }

    loadData()
  }, [])

  // Data grid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Project Name',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.methodology.standard}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: getStatusColor(params.value),
            color: 'white',
            fontWeight: 'medium',
          }}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: 'country',
      headerName: 'Location',
      width: 130,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box width="100%">
          <Typography variant="caption" color="text.secondary">
            {params.row.timeline.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={params.row.timeline.progress}
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      field: 'credits',
      headerName: 'Credits',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {(params.row.credits.issued / 1000).toFixed(0)}k
          </Typography>
          <Typography variant="caption" color="text.secondary">
            of {(params.row.credits.estimated / 1000).toFixed(0)}k
          </Typography>
        </Box>
      ),
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            ${(params.row.financial.revenue / 1000).toFixed(0)}k
          </Typography>
          <Typography
            variant="caption"
            color={params.row.financial.roi >= 0 ? 'success.main' : 'error.main'}
          >
            {params.row.financial.roi.toFixed(1)}% ROI
          </Typography>
        </Box>
      ),
    },
    {
      field: 'risk',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.risks.level}
          size="small"
          sx={{
            bgcolor: getRiskColor(params.row.risks.level),
            color: 'white',
            fontWeight: 'medium',
          }}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={24} />
        </Box>
        <Grid container spacing={3} mb={4}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Carbon Project Portfolio
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Comprehensive overview of your carbon mitigation project portfolio with real-time monitoring and analytics
        </Typography>

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 2 }}
          >
            New Project
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ borderRadius: 2 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ borderRadius: 2 }}
          >
            Filter
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics */}
      {metrics && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Projects"
              value={metrics.totalProjects}
              subtitle={`${metrics.activeProjects} active`}
              icon={FolderOpen}
              trend={{ value: 12, direction: 'up' }}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Credits"
              value={`${(metrics.totalCredits.estimated / 1000).toFixed(0)}k`}
              subtitle={`${(metrics.totalCredits.issued / 1000).toFixed(0)}k issued`}
              icon={Park}
              trend={{ value: 8, direction: 'up' }}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={`$${(metrics.totalRevenue / 1000000).toFixed(1)}M`}
              subtitle={`${metrics.averageROI.toFixed(1)}% avg ROI`}
              icon={AttachMoney}
              trend={{ value: 15, direction: 'up' }}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Portfolio Risk"
              value={metrics.riskDistribution.high + metrics.riskDistribution.critical > 0 ? 'Medium' : 'Low'}
              subtitle={`${metrics.riskDistribution.high + metrics.riskDistribution.critical} high-risk`}
              icon={Security}
              trend={{ value: 5, direction: 'down' }}
              color="error"
            />
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Performance Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(metrics?.typeDistribution || {}).map(([type, count]) => ({
                      name: type,
                      value: count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(metrics?.typeDistribution || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Project Portfolio
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<Analytics />}>
                Analytics
              </Button>
              <Button size="small" startIcon={<Timeline />}>
                Timeline
              </Button>
            </Stack>
          </Box>

          <DataGrid
            rows={projects}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderBottom: '2px solid rgba(224, 224, 224, 0.8)',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Add />
      </Fab>
    </Container>
  )
}

export default PortfolioDashboard

'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Button,
  ButtonGroup,
  Grid,
  Avatar,
  LinearProgress,
  Divider,
  useTheme,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Park,
  AttachMoney,
  Schedule,
  Assessment,
  FilterList,
  Download,
  Refresh,
  FullscreenExit,
  Fullscreen,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'

interface CarbonMetricsData {
  monthlyCredits: Array<{
    month: string
    issued: number
    projected: number
    retired: number
    revenue: number
  }>
  projectTypes: Array<{
    name: string
    value: number
    credits: number
    color: string
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
    color: string
  }>
  riskAssessment: Array<{
    risk: string
    projects: number
    value: number
    color: string
  }>
  kpis: {
    totalCredits: number
    totalRevenue: number
    avgROI: number
    portfolioRisk: string
    creditsTrend: number
    revenueTrend: number
  }
}

const mockData: CarbonMetricsData = {
  monthlyCredits: [
    { month: 'Jan', issued: 12000, projected: 15000, retired: 8000, revenue: 180000 },
    { month: 'Feb', issued: 19000, projected: 22000, retired: 12000, revenue: 285000 },
    { month: 'Mar', issued: 15000, projected: 18000, retired: 10000, revenue: 225000 },
    { month: 'Apr', issued: 22000, projected: 25000, retired: 15000, revenue: 330000 },
    { month: 'May', issued: 18000, projected: 20000, retired: 13000, revenue: 270000 },
    { month: 'Jun', issued: 25000, projected: 28000, retired: 18000, revenue: 375000 },
  ],
  projectTypes: [
    { name: 'AFOLU', value: 35, credits: 89000, color: '#22c55e' },
    { name: 'Energy', value: 25, credits: 63000, color: '#3b82f6' },
    { name: 'Waste', value: 20, credits: 51000, color: '#f59e0b' },
    { name: 'Transport', value: 12, credits: 31000, color: '#8b5cf6' },
    { name: 'Buildings', value: 8, credits: 20000, color: '#ef4444' },
  ],
  statusDistribution: [
    { status: 'Implementation', count: 8, percentage: 40, color: '#3b82f6' },
    { status: 'Monitoring', count: 5, percentage: 25, color: '#10b981' },
    { status: 'Validation', count: 4, percentage: 20, color: '#f59e0b' },
    { status: 'Design', count: 2, percentage: 10, color: '#8b5cf6' },
    { status: 'Completed', count: 1, percentage: 5, color: '#374151' },
  ],
  riskAssessment: [
    { risk: 'Low', projects: 12, value: 85, color: '#22c55e' },
    { risk: 'Medium', projects: 6, value: 65, color: '#f59e0b' },
    { risk: 'High', projects: 2, value: 35, color: '#ef4444' },
    { risk: 'Critical', projects: 0, value: 0, color: '#7f1d1d' },
  ],
  kpis: {
    totalCredits: 254000,
    totalRevenue: 3810000,
    avgROI: 18.5,
    portfolioRisk: 'Low',
    creditsTrend: 12.5,
    revenueTrend: 8.3,
  }
}

interface CarbonMetricsChartProps {
  data?: CarbonMetricsData
  height?: number
}

export function CarbonMetricsChart({ data = mockData, height = 400 }: CarbonMetricsChartProps) {
  const theme = useTheme()
  const [timeRange, setTimeRange] = useState('6m')
  const [chartType, setChartType] = useState('area')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toLocaleString()
  }

  const MetricCard = ({
    title,
    value,
    trend,
    icon: Icon,
    color = 'primary'
  }: {
    title: string
    value: string | number
    trend?: number
    icon: any
    color?: string
  }) => (
    <Card
      sx={{
        p: 2,
        background: `linear-gradient(135deg, ${color === 'primary' ? 'rgba(59, 130, 246, 0.05)' :
                                             color === 'success' ? 'rgba(34, 197, 94, 0.05)' :
                                             color === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                                             'rgba(139, 69, 19, 0.05)'} 0%, rgba(255, 255, 255, 0.02) 100%)`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" mt={0.5}>
              {trend >= 0 ? (
                <TrendingUp sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
              )}
              <Typography
                variant="caption"
                color={trend >= 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          <Icon />
        </Avatar>
      </Stack>
    </Card>
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, maxWidth: 200 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} display="flex" justifyContent="space-between">
              <Typography variant="caption" color={entry.color}>
                {entry.dataKey}:
              </Typography>
              <Typography variant="caption" fontWeight="medium">
                {formatNumber(entry.value)}
              </Typography>
            </Box>
          ))}
        </Card>
      )
    }
    return null
  }

  return (
    <Box sx={{ height: isFullscreen ? '100vh' : 'auto' }}>
      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Credits"
            value={formatNumber(data.kpis.totalCredits)}
            trend={data.kpis.creditsTrend}
            icon={Park}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${formatNumber(data.kpis.totalRevenue)}`}
            trend={data.kpis.revenueTrend}
            icon={AttachMoney}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average ROI"
            value={`${data.kpis.avgROI}%`}
            icon={TrendingUp}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Portfolio Risk"
            value={data.kpis.portfolioRisk}
            icon={Assessment}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: height }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Carbon Credits Performance
                </Typography>
                <Stack direction="row" spacing={1}>
                  <ButtonGroup size="small" variant="outlined">
                    {['3m', '6m', '1y', '2y'].map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'contained' : 'outlined'}
                        onClick={() => setTimeRange(range)}
                        size="small"
                      >
                        {range}
                      </Button>
                    ))}
                  </ButtonGroup>
                  <Tooltip title="Chart Type">
                    <IconButton
                      size="small"
                      onClick={() => setChartType(chartType === 'area' ? 'line' : 'area')}
                    >
                      <Assessment />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                    <IconButton
                      size="small"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <ResponsiveContainer width="100%" height={height - 120}>
                {chartType === 'area' ? (
                  <AreaChart data={data.monthlyCredits}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="issued"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                      name="Issued Credits"
                    />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                      name="Projected Credits"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={data.monthlyCredits}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="issued"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      name="Issued Credits"
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      name="Projected Credits"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Types Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: height }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Project Distribution
              </Typography>

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.projectTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.projectTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value}%`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {data.projectTypes.map((type, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: type.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{type.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {type.value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Assessment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Risk Assessment
              </Typography>

              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart innerRadius="10%" outerRadius="80%" data={data.riskAssessment}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <RechartsTooltip />
                </RadialBarChart>
              </ResponsiveContainer>

              <Stack spacing={2} mt={2}>
                {data.riskAssessment.map((risk, index) => (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{risk.risk} Risk</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {risk.projects} projects
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={risk.value}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: risk.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Project Status
              </Typography>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.statusDistribution} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={80} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {data.statusDistribution.map((status, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                    <Chip
                      label={status.status}
                      size="small"
                      sx={{
                        bgcolor: status.color,
                        color: 'white',
                        fontWeight: 'medium',
                      }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {status.percentage}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CarbonMetricsChart

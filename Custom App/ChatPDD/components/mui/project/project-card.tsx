'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
  Box,
  Stack,
  Divider,
  Button,
  Tooltip,
  AvatarGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import {
  MoreVert,
  LocationOn,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Eco,
  AttachMoney,
  Group,
  Edit,
  Delete,
  Visibility,
  Share,
  Download,
  Warning,
  CheckCircle,
  Schedule,
  Flag,
} from '@mui/icons-material'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface ProjectCardProps {
  project: {
    id: string
    name: string
    type: string
    status: string
    country: string
    region?: string
    methodology: {
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
      level: string
      score: number
    }
    team: string[]
    lastUpdate: string
  }
  onEdit?: (projectId: string) => void
  onDelete?: (projectId: string) => void
  onView?: (projectId: string) => void
}

const statusColors: Record<string, string> = {
  PLANNING: '#6b7280',
  DESIGN: '#8b5cf6',
  VALIDATION: '#f59e0b',
  IMPLEMENTATION: '#3b82f6',
  MONITORING: '#10b981',
  VERIFICATION: '#059669',
  COMPLETED: '#374151',
}

const riskColors: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
}

const typeIcons: Record<string, React.ReactNode> = {
  AFOLU: '🌳',
  ENERGY: '⚡',
  WASTE: '♻️',
  TRANSPORT: '🚊',
  MANUFACTURING: '🏭',
  BUILDINGS: '🏢',
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleDeleteConfirm = () => {
    onDelete?.(project.id)
    setDeleteDialogOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle sx={{ color: statusColors[status] }} />
      case 'IMPLEMENTATION': case 'MONITORING': return <Schedule sx={{ color: statusColors[status] }} />
      case 'VALIDATION': return <Warning sx={{ color: statusColors[status] }} />
      default: return <Flag sx={{ color: statusColors[status] }} />
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle sx={{ color: riskColors[level], fontSize: 16 }} />
      case 'MEDIUM': return <Warning sx={{ color: riskColors[level], fontSize: 16 }} />
      case 'HIGH': case 'CRITICAL': return <Warning sx={{ color: riskColors[level], fontSize: 16 }} />
      default: return <Schedule sx={{ color: '#6b7280', fontSize: 16 }} />
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`
    return `$${amount.toLocaleString()}`
  }

  const formatCredits = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`
    return amount.toLocaleString()
  }

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
            borderColor: 'primary.main',
          },
        }}
      >
        <CardContent sx={{ flex: 1, p: 3 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                  {project.name}
                </Typography>
                <Box sx={{ fontSize: '1.2rem' }}>
                  {typeIcons[project.type]}
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip
                  icon={getStatusIcon(project.status)}
                  label={project.status}
                  size="small"
                  sx={{
                    bgcolor: statusColors[project.status],
                    color: 'white',
                    fontWeight: 'medium',
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                  }}
                />
                <Chip
                  label={project.type}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
            
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Location & Methodology */}
          <Stack spacing={1} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {project.country}{project.region && `, ${project.region}`}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {project.methodology.standard} • {project.methodology.name}
            </Typography>
          </Stack>

          {/* Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.timeline.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.timeline.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${statusColors[project.status]}, ${statusColors[project.status]}dd)`,
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Key Metrics */}
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Credits Issued
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCredits(project.credits.issued)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of {formatCredits(project.credits.estimated)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Revenue
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(project.financial.revenue)}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {project.financial.roi >= 0 ? (
                    <TrendingUp sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
                  )}
                  <Typography
                    variant="caption"
                    color={project.financial.roi >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {project.financial.roi.toFixed(1)}% ROI
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                {getRiskIcon(project.risks.level)}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {project.risks.level} Risk
                </Typography>
              </Box>
              <Tooltip title={project.team.join(', ')}>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                  {project.team.slice(0, 3).map((member, index) => (
                    <Avatar key={index} sx={{ bgcolor: 'primary.main' }}>
                      {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Tooltip>
            </Box>
          </Stack>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Updated {new Date(project.lastUpdate).toLocaleDateString()}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView?.(project.id)}
            sx={{ borderRadius: 2 }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 160 },
        }}
      >
        <MenuItem onClick={() => { onView?.(project.id); handleMenuClose() }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => { onEdit?.(project.id); handleMenuClose() }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          Export Data
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Warning color="error" />
            <Typography variant="h6">Delete Project</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{project.name}</strong>? 
            This action cannot be undone and will remove all associated data, 
            milestones, and reports.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjectCard
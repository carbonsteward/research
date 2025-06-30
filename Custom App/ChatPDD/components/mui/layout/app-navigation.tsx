'use client'

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Dashboard,
  FolderOpen,
  Timeline,
  Analytics,
  Park,
  Security,
  Group,
  Science,
  Policy,
  TrendingUp,
  MonitorHeart,
  Assessment,
  LocationOn,
  CloudDownload,
  Search,
  Add,
  Help,
  Brightness4,
  People,
  Chat,
  Workspaces,
  Brightness7,
} from '@mui/icons-material'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderOpen />,
    path: '/projects',
    badge: 4,
    children: [
      { id: 'all-projects', label: 'All Projects', icon: <FolderOpen />, path: '/projects' },
      { id: 'new-project', label: 'New Project', icon: <Add />, path: '/project/new' },
      { id: 'project-timeline', label: 'Timeline', icon: <Timeline />, path: '/projects/timeline' },
    ],
  },
  {
    id: 'methodologies',
    label: 'Methodologies',
    icon: <Science />,
    path: '/methodologies',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: <MonitorHeart />,
    path: '/monitoring',
    badge: 2,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Analytics />,
    path: '/analytics',
    children: [
      { id: 'portfolio-analytics', label: 'Portfolio', icon: <Assessment />, path: '/analytics/portfolio' },
      { id: 'market-trends', label: 'Market Trends', icon: <TrendingUp />, path: '/analytics/trends' },
      { id: 'risk-analysis', label: 'Risk Analysis', icon: <Security />, path: '/analytics/risks' },
    ],
  },
  {
    id: 'risks',
    label: 'Risk Assessment',
    icon: <Security />,
    path: '/risks',
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: <Policy />,
    path: '/policies',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: <People />,
    path: '/collaboration',
    children: [
      { id: 'workspace', label: 'Team Workspace', icon: <Workspaces />, path: '/collaboration' },
      { id: 'discussions', label: 'Discussions', icon: <Chat />, path: '/collaboration?tab=discussions' },
      { id: 'team-management', label: 'Team Management', icon: <Group />, path: '/collaboration?tab=team' },
      { id: 'activity-feed', label: 'Activity Feed', icon: <Timeline />, path: '/collaboration?tab=activity' },
    ],
  },
]

interface AppNavigationProps {
  children: React.ReactNode
}

export function AppNavigation({ children }: AppNavigationProps) {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null)
  const [selectedItem, setSelectedItem] = useState('dashboard')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null)
  }

  const drawerWidth = 280

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <Park />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              ChatPDD
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Carbon Project Platform
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Add />}
          sx={{
            mb: 1,
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            },
          }}
        >
          New Project
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Search />}
            sx={{ flex: 1 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudDownload />}
            sx={{ flex: 1 }}
          >
            Import
          </Button>
        </Stack>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={selectedItem === item.id}
              onClick={() => setSelectedItem(item.id)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.8),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selectedItem === item.id ? 600 : 400,
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    fontSize: '0.75rem',
                    height: 20,
                    minWidth: 20,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src="/api/placeholder/32/32"
            sx={{ width: 32, height: 32 }}
          >
            JD
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              John Developer
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Project Manager
            </Typography>
          </Box>
          <IconButton size="small">
            <Settings fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Portfolio Dashboard
          </Typography>

          {/* Right side actions */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Notifications */}
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={4} color="error">
                <Notifications sx={{ color: 'text.primary' }} />
              </Badge>
            </IconButton>

            {/* Profile */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                src="/api/placeholder/32/32"
                sx={{ width: 32, height: 32 }}
              >
                JD
              </Avatar>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem>
          <Avatar /> My Account
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Help fontSize="small" />
          </ListItemIcon>
          Help
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <MenuItem>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight="medium">
              New milestone due tomorrow
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Amazon Rainforest Conservation - Validation phase
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight="medium">
              Risk level increased
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Solar Farm Initiative - Weather concerns
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight="medium">
              Credits issued successfully
            </Typography>
            <Typography variant="caption" color="text.secondary">
              12,000 VCUs issued for Project #VCS-001
            </Typography>
          </Stack>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AppNavigation

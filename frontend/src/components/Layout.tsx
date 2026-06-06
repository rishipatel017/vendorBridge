import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Tooltip, Badge, IconButton, Divider, Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Business,
  Description,
  RequestQuote,
  Approval,
  ShoppingCart,
  Receipt,
  Assessment,
  History,
  Logout,
  Notifications,
  ChevronLeft,
  ChevronRight,
  Circle,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../store/store'
import { logout } from '../store/slices/authSlice'

const DRAWER_WIDTH = 260
const DRAWER_COLLAPSED = 72

interface NavItem {
  text: string
  icon: React.ReactElement
  path: string
  roles?: string[]
  badge?: number
}

const navItems: NavItem[] = [
  { text: 'Dashboard',       icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Vendors',         icon: <Business />,      path: '/vendors',         roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { text: 'RFQ',             icon: <Description />,   path: '/rfq',             roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { text: 'Quotations',      icon: <RequestQuote />,  path: '/quotations',      roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
  { text: 'Approvals',       icon: <Approval />,      path: '/approvals',       roles: ['ADMIN', 'MANAGER'] },
  { text: 'Purchase Orders', icon: <ShoppingCart />,  path: '/purchase-orders', roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { text: 'Invoices',        icon: <Receipt />,       path: '/invoices',        roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { text: 'Reports',         icon: <Assessment />,    path: '/reports',         roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
  { text: 'Audit Log',       icon: <History />,       path: '/audit',           roles: ['ADMIN'] },
  { text: 'Profile',         icon: <Circle />,        path: '/profile' },
]

const roleColors: Record<string, string> = {
  ADMIN: '#ef4444',
  PROCUREMENT_OFFICER: '#4f46e5',
  VENDOR: '#10b981',
  MANAGER: '#f59e0b',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  PROCUREMENT_OFFICER: 'Proc. Officer',
  VENDOR: 'Vendor',
  MANAGER: 'Manager',
}

const Layout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)
  const [collapsed, setCollapsed] = useState(false)
  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const visibleItems = navItems.filter(
    item => !item.roles || item.roles.includes(user?.role || '')
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Brand */}
        <Box sx={{ px: 2, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'Outfit' }}>VB</Typography>
          </Box>
          {!collapsed && (
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'text.primary', fontFamily: 'Outfit', lineHeight: 1.2 }}>
                VendorBridge
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1 }}>ERP Platform</Typography>
            </Box>
          )}
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: 'text.secondary' }}>
              {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mx: 2, borderColor: 'divider' }} />

        {/* Nav Items */}
        <List sx={{ flex: 1, pt: 1, px: 0 }}>
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Tooltip key={item.path} title={collapsed ? item.text : ''} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  selected={isActive}
                  sx={{ mx: 1, mb: 0.25, borderRadius: 2, minHeight: 44 }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 1 }}>
                    <Box sx={{ color: isActive ? 'primary.light' : 'text.secondary', display: 'flex', fontSize: 20 }}>
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? 'primary.light' : 'text.secondary' }}
                    />
                  )}
                  {!collapsed && item.badge && (
                    <Chip label={item.badge} size="small" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                  )}
                </ListItemButton>
              </Tooltip>
            )
          })}
        </List>

        <Divider sx={{ mx: 2, borderColor: 'divider' }} />

        {/* User section */}
        <Box sx={{ p: 2 }}>
          {!collapsed ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(148,163,184,0.05)' }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: roleColors[user?.role || ''] || '#4f46e5' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                  <Circle sx={{ fontSize: 7, color: '#10b981' }} />
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {roleLabels[user?.role || ''] || user?.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Tooltip title={`${user?.firstName} ${user?.lastName}`} placement="right">
              <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: roleColors[user?.role || ''] || '#4f46e5', mb: 1 }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </Tooltip>
          )}

          <Tooltip title="Logout" placement={collapsed ? 'right' : 'top'}>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, px: collapsed ? 1 : 1.5, minHeight: 40 }}>
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36 }}>
                <Logout fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <Box component="main" sx={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'Outfit' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => navigate('/notifications')}>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: '1px solid', borderColor: 'divider' }}>
            <Avatar 
              sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: roleColors[user?.role || ''] || '#4f46e5', cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                {roleLabels[user?.role || ''] || user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout

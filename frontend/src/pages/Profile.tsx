import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Avatar, CircularProgress, Divider, Chip,
} from '@mui/material'
import { AppDispatch, RootState } from '../store/store'
import api from '../services/api'

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', formData)
      // Refresh user data
      const res = await api.get('/users/me')
      // Update user in store if needed
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const roleColors: Record<string, string> = {
    ADMIN: '#ef4444',
    PROCUREMENT_OFFICER: '#4f46e5',
    VENDOR: '#10b981',
    MANAGER: '#f59e0b',
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    PROCUREMENT_OFFICER: 'Procurement Officer',
    VENDOR: 'Vendor',
    MANAGER: 'Manager',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800 }}>
      <Box className="page-header">
        <Typography variant="h1">Profile</Typography>
        <Typography>Manage your account settings and preferences</Typography>
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              sx={{ width: 80, height: 80, fontSize: 32, fontWeight: 700, bgcolor: roleColors[user.role] || '#4f46e5' }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1 }}>{user.email}</Typography>
              <Chip
                label={roleLabels[user.role] || user.role}
                sx={{
                  bgcolor: roleColors[user.role] || '#4f46e5',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                disabled={loading}
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                disabled={loading}
              />
            </Box>

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              disabled
              helperText="Email cannot be changed"
            />

            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ minWidth: 120 }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Account Information</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'text.secondary' }}>User ID</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>{user.id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'text.secondary' }}>Role</Typography>
              <Typography sx={{ fontWeight: 600 }}>{roleLabels[user.role] || user.role}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'text.secondary' }}>Status</Typography>
              <Chip label="Active" color="success" size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'text.secondary' }}>Created At</Typography>
              <Typography sx={{ fontSize: 13 }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Profile

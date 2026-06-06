import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Alert, InputAdornment,
  IconButton, CircularProgress, MenuItem, LinearProgress,
} from '@mui/material'
import { Email, Lock, Person, Visibility, VisibilityOff, ArrowForward, Badge } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { register as registerUser } from '../store/slices/authSlice'
import logo from '../assets/logo.png'

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  role: z.string().min(1, 'Select a role'),
})
type FormData = z.infer<typeof schema>

const passwordStrength = (password: string) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981']
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

const Register = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'PROCUREMENT_OFFICER' },
  })

  const strength = passwordStrength(password)

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(registerUser(data)).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (_) {}
  }

  return (
    <Box className="auth-bg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, minHeight: '100vh' }}>
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
        top: '5%', right: '5%', pointerEvents: 'none',
      }} />

      <Box className="auth-card animate-in" sx={{ position: 'relative', zIndex: 1, maxWidth: 460, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box
            component="img"
            src={logo}
            alt="VendorBridge Logo"
            sx={{
              width: 44, height: 44, borderRadius: 2,
              objectFit: 'contain',
              boxShadow: '0 4px 16px rgba(79,70,229,0.2)',
            }}
          />
          <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#f1f5f9' }}>
            VendorBridge ERP
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: '#f1f5f9', mb: 0.5 }}>
          Create account
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#94a3b8', mb: 3 }}>
          Join the platform to manage procurement workflows
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>Account created! Redirecting to login…</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              {...register('firstName')}
              label="First Name" fullWidth size="small"
              error={!!errors.firstName} helperText={errors.firstName?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            />
            <TextField
              {...register('lastName')}
              label="Last Name" fullWidth size="small"
              error={!!errors.lastName} helperText={errors.lastName?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
            />
          </Box>

          <TextField
            {...register('email')}
            label="Email Address" type="email" fullWidth size="small"
            error={!!errors.email} helperText={errors.email?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}
          />

          <TextField
            {...register('role')}
            label="Role" fullWidth size="small" select
            error={!!errors.role} helperText={errors.role?.message}
            defaultValue="PROCUREMENT_OFFICER"
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="PROCUREMENT_OFFICER">Procurement Officer</MenuItem>
            <MenuItem value="MANAGER">Manager / Approver</MenuItem>
            <MenuItem value="VENDOR">Vendor</MenuItem>
          </TextField>

          <Box>
            <TextField
              {...register('password')}
              label="Password" type={showPassword ? 'text' : 'password'} fullWidth size="small"
              error={!!errors.password} helperText={errors.password?.message}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {password.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(strength / 5) * 100}
                  sx={{
                    height: 4, borderRadius: 2,
                    bgcolor: 'rgba(148,163,184,0.15)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strengthColors[strength - 1] || '#ef4444',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                    },
                  }}
                />
                <Typography sx={{ fontSize: 11, color: strengthColors[strength - 1] || '#ef4444', mt: 0.5 }}>
                  {strengthLabels[strength - 1] || 'Very Weak'}
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            type="submit" variant="contained" fullWidth disabled={loading || success}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
            sx={{
              mt: 0.5, py: 1.4, fontSize: 15,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)' },
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Register

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Alert, InputAdornment,
  IconButton, CircularProgress,
} from '@mui/material'
import { Email, Lock, Visibility, VisibilityOff, ArrowForward } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { login } from '../store/slices/authSlice'
import logo from '../assets/logo.png'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

const Login = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(login(data)).unwrap()
      navigate('/dashboard')
    } catch (_) {}
  }

  return (
    <Box className="auth-bg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      {/* Animated orbs */}
      <Box sx={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.2), transparent 70%)',
        top: '15%', left: '10%', animation: 'pulse 4s ease-in-out infinite',
        '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.15), transparent 70%)',
        bottom: '20%', right: '15%', animation: 'pulse 5s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <Box className="auth-card animate-in" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
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
          <Box>
            <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#f1f5f9', lineHeight: 1.2 }}>
              VendorBridge
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#64748b' }}>Procurement ERP</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 26, color: '#f1f5f9', mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#94a3b8', mb: 3 }}>
          Sign in to your account to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('email')}
            label="Email Address"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
            sx={{
              mt: 1, py: 1.4, fontSize: 15,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)' },
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 14, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Login

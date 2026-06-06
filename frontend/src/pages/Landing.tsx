import { Link } from 'react-router-dom'
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material'
import { Business, Description, ShoppingCart, Receipt, TrendingUp, Security, CheckCircle } from '@mui/icons-material'
import logo from '../assets/logo.png'

const Landing = () => {
  const features = [
    { icon: <Business sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'Vendor Management', description: 'Streamline vendor registration, GST validation, and performance tracking.' },
    { icon: <Description sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'RFQ Management', description: 'Create and manage Request for Quotations with automated workflows.' },
    { icon: <ShoppingCart sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'Purchase Orders', description: 'Generate purchase orders from approved quotations with multi-level approvals.' },
    { icon: <Receipt sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'Invoice Processing', description: 'Automate invoice generation, GST calculations, and payment tracking.' },
    { icon: <TrendingUp sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'Analytics & Reports', description: 'Gain insights with comprehensive reports on vendor performance and spend.' },
    { icon: <Security sx={{ fontSize: 48, color: '#818cf8' }} />, title: 'Secure & Compliant', description: 'Enterprise-grade security with role-based access control and audit logging.' }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', pt: { xs: 12, md: 20 }, pb: { xs: 10, md: 16 }, px: 3 }}>
        {/* Animated background elements */}
        <Box sx={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%)', bottom: '-20%', right: '-10%', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="animate-in" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="VendorBridge Logo"
                    sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'contain', boxShadow: '0 4px 16px rgba(79,70,229,0.2)' }}
                  />
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, p: 1, pr: 2, borderRadius: 10, bgcolor: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)' }}>
                    <span className="status-badge badge-active" style={{ margin: 0 }}>v2.0 Beta</span>
                    <Typography sx={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>Next-Gen Procurement</Typography>
                  </Box>
                </Box>
                <Typography variant="h1" sx={{ fontSize: { xs: 48, md: 64 }, lineHeight: 1.1, mb: 3, background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Modernize Your Procure-to-Pay Lifecycle.
                </Typography>
                <Typography sx={{ fontSize: 18, color: 'text.secondary', mb: 5, maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
                  A comprehensive procurement and vendor management system that automates RFQ, quotations, approvals, purchase orders, and analytics in one powerful platform.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Button component={Link} to="/register" variant="contained" size="large" sx={{ px: 4, py: 1.5, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    Start Free Trial
                  </Button>
                  <Button component={Link} to="/login" variant="outlined" size="large" sx={{ px: 4, py: 1.5, borderColor: 'rgba(148,163,184,0.3)', color: '#f1f5f9' }}>
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box className="glass-card animate-in animate-in-delay-2" sx={{ p: 4, position: 'relative' }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Procurement Pipeline</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {['Vendor Onboarding', 'RFQ & Quotation', 'Multi-level Approval', 'PO Generation', 'Invoice & Payment'].map((step, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.1)' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                        {idx + 1}
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{step}</Typography>
                      <CheckCircle sx={{ ml: 'auto', color: 'success.main', fontSize: 20 }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: '#0c1222', borderTop: '1px solid rgba(148,163,184,0.05)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>Powerful Features</Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Everything you need to manage your procurement process efficiently and securely.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="glass-card" sx={{ height: '100%', p: 1 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 3, display: 'inline-flex', p: 2, borderRadius: 3, bgcolor: 'rgba(79,70,229,0.1)' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>{feature.title}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
          © {new Date().getFullYear()} VendorBridge ERP. Crafted with ❤️ for Procurement Teams.
        </Typography>
      </Box>
    </Box>
  )
}

export default Landing

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from '@mui/material'
import { Business, Description, Approval, CurrencyRupee, History, ShoppingCart, Receipt, RequestQuote, CheckCircle, Cancel } from '@mui/icons-material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { AppDispatch, RootState } from '../store/store'
import { fetchDashboard } from '../store/slices/reportSlice'
import { format } from 'date-fns'

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboard, loading, error } = useSelector((state: RootState) => state.reports)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  if (!dashboard) return null

  const { kpis, monthlySpending, vendorPerformance, recentPOs, recentActivity } = dashboard

  // Role-based dashboard content
  const isAdmin = user?.role === 'ADMIN'
  const isProcurementOfficer = user?.role === 'PROCUREMENT_OFFICER'
  const isVendor = user?.role === 'VENDOR'
  const isManager = user?.role === 'MANAGER'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box className="page-header">
        <Typography variant="h1">Dashboard</Typography>
        <Typography>Overview of your procurement metrics</Typography>
      </Box>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <Grid container spacing={3}>
        {isAdmin && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-blue">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CurrencyRupee sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Total Procurement</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  ₹{kpis.totalProcurement?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-purple">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Business sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Active Vendors</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.totalVendors || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-emerald">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Description sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Active RFQs</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.activeRFQs || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-amber">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Approval sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Pending Approvals</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.pendingApprovals || 0}
                </Typography>
              </Box>
            </Grid>
          </>
        )}
        {isProcurementOfficer && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-blue">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CurrencyRupee sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>My Procurement</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  ₹{kpis.totalProcurement?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-purple">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Description sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>My RFQs</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.myRFQs || kpis.activeRFQs || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-emerald">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <ShoppingCart sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Open POs</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.openPOs || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-amber">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Receipt sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Pending Invoices</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.pendingInvoices || 0}
                </Typography>
              </Box>
            </Grid>
          </>
        )}
        {isVendor && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-blue">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CurrencyRupee sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Total Revenue</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  ₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-purple">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Description sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>RFQ Invitations</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.rfqInvitations || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-emerald">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <RequestQuote sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Quotations Sent</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.quotationsSent || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-amber">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Approval sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Pending Deliveries</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.pendingDeliveries || 0}
                </Typography>
              </Box>
            </Grid>
          </>
        )}
        {isManager && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-blue">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Approval sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Pending Approvals</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.pendingApprovals || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-purple">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Approved Today</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.approvedToday || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-emerald">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Cancel sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Rejected Today</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  {kpis.rejectedToday || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box className="kpi-card gradient-card-amber">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CurrencyRupee sx={{ fontSize: 28, opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>Avg Approval Value</Typography>
                </Box>
                <Typography sx={{ fontSize: 32, fontWeight: 700, fontFamily: 'Outfit' }}>
                  ₹{kpis.avgApprovalValue?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Grid>
          </>
        )}
      </Grid>

      {/* ── Charts ────────────────────────────────────────────────────── */}
      {(isAdmin || isProcurementOfficer) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Monthly Spending (12 Months)</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spend']} />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" fill="rgba(79,70,229,0.2)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Vendor Performance</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={vendorPerformance}
                    cx="50%" cy="45%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="ratingScore"
                    nameKey="companyName"
                  >
                    {vendorPerformance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${Math.round(value)}% Rating`, 'Performance']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {isVendor && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Revenue by Month</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" fill="rgba(16,185,129,0.2)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 400, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quotation Success Rate</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={vendorPerformance}
                    cx="50%" cy="45%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="ratingScore"
                    nameKey="companyName"
                  >
                    {vendorPerformance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${Math.round(value)}%`, 'Success Rate']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Tables ────────────────────────────────────────────────────── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Purchase Orders</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table className="vb-table">
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPOs.map(po => (
                    <TableRow key={po.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{po.poNumber}</TableCell>
                      <TableCell>{po.vendor?.companyName}</TableCell>
                      <TableCell>{format(new Date(po.createdAt), 'dd MMM yyyy')}</TableCell>
                      <TableCell align="right">₹{po.grandTotal.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <span className={`status-badge badge-${po.status.toLowerCase()}`}>
                          {po.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentPOs.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No recent purchase orders</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <History fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="h6">Activity Log</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivity.map(log => (
                <Box key={log.id} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main',
                    mt: 0.8, flexShrink: 0,
                  }} />
                  <Box>
                    <Typography sx={{ fontSize: 13 }}>
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {log.user?.firstName} {log.user?.lastName}
                      </Box>{' '}
                      {log.action} <Box component="span" sx={{ fontWeight: 600 }}>{log.entity}</Box>
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                      {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {recentActivity.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>
                  No recent activity
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard

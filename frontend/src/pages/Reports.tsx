import { useState } from 'react'
import {
  Box, Typography, Card, Grid, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress
} from '@mui/material'
import { Assessment, Download } from '@mui/icons-material'
import api from '../services/api'
import { format } from 'date-fns'

const Reports = () => {
  const [reportType, setReportType] = useState('vendor')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', new Date(startDate).toISOString())
      if (endDate) params.append('endDate', new Date(endDate).toISOString())
      
      const res = await api.get(`/reports/${reportType}?${params.toString()}`)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderTable = () => {
    if (!data) return null

    if (reportType === 'vendor') {
      return (
        <Table className="vb-table">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Perf. Rate</TableCell>
              <TableCell align="right">Total Spend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell sx={{ fontWeight: 600 }}>{v.companyName}</TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell align="center">{Math.round(v.ratingScore)}%</TableCell>
                <TableCell align="center">{v.performanceRate}%</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>₹{v.totalSpend.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No data found</TableCell></TableRow>}
          </TableBody>
        </Table>
      )
    }

    if (reportType === 'purchase') {
      const items = data.data || []
      return (
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
            {items.map((po: any) => (
              <TableRow key={po.id}>
                <TableCell sx={{ fontWeight: 600 }}>{po.poNumber}</TableCell>
                <TableCell>{po.vendor?.companyName}</TableCell>
                <TableCell>{format(new Date(po.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>₹{po.grandTotal.toLocaleString()}</TableCell>
                <TableCell align="center"><span className={`status-badge badge-${po.status.toLowerCase()}`}>{po.status}</span></TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No data found</TableCell></TableRow>}
          </TableBody>
        </Table>
      )
    }

    if (reportType === 'invoice') {
      const items = data.data || []
      return (
        <Table className="vb-table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>PO Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((inv: any) => (
              <TableRow key={inv.id}>
                <TableCell sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{inv.po?.poNumber}</TableCell>
                <TableCell>{inv.vendor?.companyName}</TableCell>
                <TableCell>{format(new Date(inv.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>₹{inv.totalAmount.toLocaleString()}</TableCell>
                <TableCell align="center"><span className={`status-badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span></TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No data found</TableCell></TableRow>}
          </TableBody>
        </Table>
      )
    }

    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Reports Center</Typography>
          <Typography>Generate and export procurement reports</Typography>
        </Box>
      </Box>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              label="Report Type"
              fullWidth
              size="small"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="vendor">Vendor Performance</MenuItem>
              <MenuItem value="purchase">Purchase Orders</MenuItem>
              <MenuItem value="invoice">Invoices & Payments</MenuItem>
              <MenuItem value="spend-analysis">Spend Analysis</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Assessment />}
              onClick={handleGenerate}
              disabled={loading}
              sx={{ py: 1, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {data && reportType !== 'spend-analysis' && (
        <Card sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Report Results</Typography>
            <Button startIcon={<Download />} size="small" variant="outlined">Export CSV</Button>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            {renderTable()}
          </Box>
        </Card>
      )}

      {data && reportType === 'spend-analysis' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Spend by Vendor</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.byVendor?.map((v: any) => (
                  <Box key={v.vendorName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{v.vendorName}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{v.count} Invoices</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'primary.light' }}>₹{v.totalAmount.toLocaleString()}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Spend by Month</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(data.byMonth || {}).map(([month, amount]: [string, any]) => (
                  <Box key={month} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>{month}</Typography>
                    <Typography sx={{ fontWeight: 700, color: 'primary.light' }}>₹{amount.toLocaleString()}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default Reports

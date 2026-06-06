import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Card, Grid, Divider, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Button,
} from '@mui/material'
import { ArrowBack, CheckCircle, MonetizationOn } from '@mui/icons-material'
import api from '../services/api'
import { format } from 'date-fns'
import { RootState } from '../store/store'

const RFQDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [rfq, setRfq] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/rfq/${id}`)
        setRfq(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  if (!rfq) return <Typography>RFQ not found</Typography>

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rfq')} sx={{ color: 'text.secondary' }}>
          Back to List
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>{rfq.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{rfq.rfqNumber}</Typography>
            <span className={`status-badge badge-${rfq.status.toLowerCase()}`}>
              {rfq.status.replace('_', ' ')}
            </span>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>{rfq.description || 'No description provided.'}</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>Required By</Typography>
                <Typography sx={{ fontWeight: 600 }}>{format(new Date(rfq.requiredDate), 'dd MMM yyyy')}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>Submission Deadline</Typography>
                <Typography sx={{ fontWeight: 600 }}>{format(new Date(rfq.deadline), 'dd MMM yyyy')}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>Created By</Typography>
                <Typography sx={{ fontWeight: 600 }}>{rfq.creator?.firstName} {rfq.creator?.lastName}</Typography>
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">Requested Items</Typography>
            </Box>
            <Table className="vb-table">
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rfq.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Invited Vendors</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {rfq.vendors?.map((v: any) => (
                <Box key={v.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>{v.vendor.companyName}</Typography>
                  {rfq.quotations?.find((q: any) => q.vendorId === v.vendorId) ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Pending</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Card>

          {user?.role !== 'VENDOR' && (
            <Card sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn color="primary" />
                <Typography variant="h6">Received Quotations</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {rfq.quotations?.map((q: any) => (
                  <Box key={q.id} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{q.quotationNumber}</Typography>
                      <span className={`status-badge badge-${q.status.toLowerCase()}`}>{q.status}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Total Amount:</Typography>
                      <Typography sx={{ fontWeight: 700, color: 'primary.light' }}>₹{q.grandTotal.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                ))}
                {(!rfq.quotations || rfq.quotations.length === 0) && (
                  <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No quotations received yet</Typography>
                )}
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default RFQDetail

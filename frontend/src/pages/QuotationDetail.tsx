import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Card, Grid, Divider, CircularProgress, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material'
import { ArrowBack, Send, CheckCircle, Cancel } from '@mui/icons-material'
import { RootState } from '../store/store'
import api from '../services/api'

const QuotationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await api.get(`/quotation/${id}`)
        setQuotation(res.data)
      } catch (err) {
        console.error('Failed to fetch quotation:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuotation()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!quotation) {
    return <Typography>Quotation not found</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/quotations')} sx={{ color: 'text.secondary' }}>
          Back to List
        </Button>
      </Box>

      <Card sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>{quotation.quotationNumber}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  RFQ Reference: {quotation.rfq?.rfqNumber}
                </Typography>
              </Box>
              <Chip label={quotation.status} color={quotation.status === 'ACCEPTED' ? 'success' : quotation.status === 'REJECTED' ? 'error' : 'default'} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Vendor</Typography>
            <Typography variant="h6">{quotation.vendor?.companyName}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>{quotation.vendor?.email}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Delivery Timeline</Typography>
            <Typography variant="h6">{quotation.deliveryDays} days</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Quotation Items</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotation.items?.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">₹{item.unitPrice?.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{item.lineTotal?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: 'text.secondary' }}>Subtotal:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Tax ({quotation.taxPercent}%):</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>Grand Total:</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                <Typography>₹{quotation.subtotal?.toLocaleString()}</Typography>
                <Typography>₹{quotation.taxAmount?.toLocaleString()}</Typography>
                <Typography variant="h6" sx={{ mt: 1, color: 'primary.main' }}>₹{quotation.grandTotal?.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Grid>

          {quotation.approval && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>Approval Status</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip label={quotation.approval.status} color={quotation.approval.status === 'APPROVED' ? 'success' : quotation.approval.status === 'REJECTED' ? 'error' : 'default'} />
                <Typography sx={{ color: 'text.secondary' }}>
                  Level: {quotation.approval.level}
                </Typography>
                {quotation.approval.remarks && (
                  <Typography sx={{ color: 'text.secondary' }}>
                    Remarks: {quotation.approval.remarks}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>
    </Box>
  )
}

export default QuotationDetail

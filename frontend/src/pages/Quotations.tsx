import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Button, CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import { Visibility, Send, CheckCircle, Cancel } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchQuotations, submitQuotation } from '../store/slices/quotationSlice'
import { submitForApproval } from '../store/slices/approvalSlice'
import { format } from 'date-fns'

const Quotations = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { quotations, loading } = useSelector((state: RootState) => state.quotations)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchQuotations())
  }, [dispatch])

  const handleSendForApproval = async (id: string) => {
    try {
      await dispatch(submitForApproval(id)).unwrap()
      dispatch(fetchQuotations())
    } catch (err) {
      console.error('Failed to send for approval:', err)
    }
  }

  const handleSubmitQuotation = async (id: string) => {
    try {
      await dispatch(submitQuotation(id)).unwrap()
      dispatch(fetchQuotations())
    } catch (err) {
      console.error('Failed to submit quotation:', err)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Quotations</Typography>
          <Typography>Review and manage quotations</Typography>
        </Box>
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table className="vb-table">
              <TableHead>
                <TableRow>
                  <TableCell>Quote Number</TableCell>
                  <TableCell>RFQ Reference</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations.map((quote: any) => (
                  <TableRow key={quote.id} sx={{ bgcolor: quote.isLowest ? 'rgba(16, 185, 129, 0.05)' : 'inherit' }}>
                    <TableCell sx={{ fontWeight: 600 }}>{quote.quotationNumber}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{quote.rfq?.rfqNumber}</TableCell>
                    <TableCell>{quote.vendor?.companyName}</TableCell>
                    <TableCell>{format(new Date(quote.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: quote.isLowest ? 'success.main' : 'inherit' }}>
                      ₹{quote.grandTotal.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <span className={`status-badge badge-${quote.status.toLowerCase()}`}>
                        {quote.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {/* VENDOR: submit draft quotation */}
                      {user?.role === 'VENDOR' && quote.status === 'DRAFT' && (
                        <Tooltip title="Submit Quotation">
                          <IconButton size="small" color="primary" onClick={() => handleSubmitQuotation(quote.id)}>
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* PROCUREMENT_OFFICER: send submitted quotation for manager approval */}
                      {user?.role === 'PROCUREMENT_OFFICER' && quote.status === 'SUBMITTED' && !quote.approval && (
                        <Tooltip title="Send for Approval">
                          <IconButton size="small" color="secondary" onClick={() => handleSendForApproval(quote.id)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/quotations/${quote.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {quotations.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No quotations found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default Quotations

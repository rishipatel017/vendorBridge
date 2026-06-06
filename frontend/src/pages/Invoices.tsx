import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import { Visibility, Send, Payment } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchInvoices, sendInvoice, markInvoicePaid } from '../store/slices/invoiceSlice'
import { format } from 'date-fns'

const Invoices = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { invoices, loading } = useSelector((state: RootState) => state.invoices)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const handleAction = async (id: string, action: 'send' | 'pay') => {
    try {
      if (action === 'send') await dispatch(sendInvoice(id)).unwrap()
      if (action === 'pay') await dispatch(markInvoicePaid(id)).unwrap()
      dispatch(fetchInvoices())
    } catch (err) {
      console.error(`Failed to ${action} invoice:`, err)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Invoices</Typography>
          <Typography>Manage vendor invoices and payments</Typography>
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
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>PO Ref</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{inv.po?.poNumber}</TableCell>
                    <TableCell>{inv.vendor?.companyName}</TableCell>
                    <TableCell>{format(new Date(inv.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>
                      ₹{inv.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <span className={`status-badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {user?.role === 'VENDOR' && inv.status === 'GENERATED' && (
                        <Tooltip title="Send to Buyer">
                          <IconButton size="small" color="primary" onClick={() => handleAction(inv.id, 'send')}>
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user?.role === 'PROCUREMENT_OFFICER' && inv.status === 'SENT' && (
                        <Tooltip title="Mark as Paid">
                          <IconButton size="small" color="success" onClick={() => handleAction(inv.id, 'pay')}>
                            <Payment fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No invoices found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default Invoices

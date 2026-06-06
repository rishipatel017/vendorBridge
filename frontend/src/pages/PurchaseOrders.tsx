import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import { Visibility, Send, LocalShipping, Receipt } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchPOs, sendPO, acceptPO, deliverPO } from '../store/slices/poSlice'
import { generateInvoice } from '../store/slices/invoiceSlice'
import { format } from 'date-fns'

const PurchaseOrders = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { pos, loading } = useSelector((state: RootState) => state.po)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchPOs())
  }, [dispatch])

  const handleAction = async (id: string, action: 'send' | 'accept' | 'deliver' | 'invoice') => {
    try {
      if (action === 'send') await dispatch(sendPO(id)).unwrap()
      if (action === 'accept') await dispatch(acceptPO(id)).unwrap()
      if (action === 'deliver') await dispatch(deliverPO(id)).unwrap()
      if (action === 'invoice') await dispatch(generateInvoice(id)).unwrap()
      dispatch(fetchPOs())
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Purchase Orders</Typography>
          <Typography>Manage and track purchase orders</Typography>
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
                  <TableCell>PO Number</TableCell>
                  <TableCell>Quotation Ref</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pos.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{po.poNumber}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{po.quotation?.quotationNumber}</TableCell>
                    <TableCell>{po.vendor?.companyName}</TableCell>
                    <TableCell>{format(new Date(po.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>
                      ₹{po.grandTotal.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <span className={`status-badge badge-${po.status.toLowerCase()}`}>
                        {po.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {user?.role === 'PROCUREMENT_OFFICER' && po.status === 'CREATED' && (
                        <Tooltip title="Send to Vendor">
                          <IconButton size="small" color="primary" onClick={() => handleAction(po.id, 'send')}>
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user?.role === 'VENDOR' && po.status === 'SENT' && (
                        <Tooltip title="Accept PO">
                          <IconButton size="small" color="success" onClick={() => handleAction(po.id, 'accept')}>
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user?.role === 'VENDOR' && po.status === 'ACCEPTED' && (
                        <Tooltip title="Mark Delivered">
                          <IconButton size="small" color="info" onClick={() => handleAction(po.id, 'deliver')}>
                            <LocalShipping fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user?.role === 'VENDOR' && po.status === 'DELIVERED' && (!po.invoices || po.invoices.length === 0) && (
                        <Tooltip title="Generate Invoice">
                          <IconButton size="small" color="secondary" onClick={() => handleAction(po.id, 'invoice')}>
                            <Receipt fontSize="small" />
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
                {pos.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No purchase orders found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default PurchaseOrders

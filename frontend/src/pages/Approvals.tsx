import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Button, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material'
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchPendingApprovals, approveRequest, rejectRequest } from '../store/slices/approvalSlice'
import { createPO } from '../store/slices/poSlice'
import { format } from 'date-fns'

const Approvals = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { pending, loading } = useSelector((state: RootState) => state.approvals)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    dispatch(fetchPendingApprovals())
  }, [dispatch])

  const handleApprove = async (id: string, quotationId: string) => {
    try {
      await dispatch(approveRequest(id)).unwrap()
      await dispatch(createPO(quotationId)).unwrap() // auto-generate PO on approval
      dispatch(fetchPendingApprovals())
    } catch (err) {
      console.error('Failed to approve request:', err)
    }
  }

  const handleReject = async () => {
    if (!selectedId || !remarks) return
    try {
      await dispatch(rejectRequest({ id: selectedId, remarks })).unwrap()
      setRejectOpen(false)
      setRemarks('')
      dispatch(fetchPendingApprovals())
    } catch (err) {
      console.error('Failed to reject request:', err)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Approvals</Typography>
          <Typography>Pending quotation approvals (Manager Review)</Typography>
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
                  <TableCell>Quotation Ref</TableCell>
                  <TableCell>RFQ Ref</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">SLA Deadline</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pending.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{app.quotation?.quotationNumber}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{app.quotation?.rfq?.rfqNumber}</TableCell>
                    <TableCell>{app.quotation?.vendor?.companyName}</TableCell>
                    <TableCell>{format(new Date(app.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.light' }}>
                      ₹{app.quotation?.grandTotal.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: new Date(app.deadline) < new Date() ? 'error.main' : 'inherit', fontWeight: 600, fontSize: 13 }}>
                        {format(new Date(app.deadline), 'dd MMM yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Approve & Generate PO">
                        <IconButton size="small" color="success" onClick={() => handleApprove(app.id, app.quotationId)}>
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton size="small" color="error" onClick={() => { setSelectedId(app.id); setRejectOpen(true) }}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {pending.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No pending approvals</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Quotation</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Please provide a reason for rejecting this quotation. The vendor will be notified.</Typography>
          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!remarks}>
            Reject Quotation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Approvals

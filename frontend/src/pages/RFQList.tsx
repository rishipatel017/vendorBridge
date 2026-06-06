import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  OutlinedInput, Chip,
} from '@mui/material'
import { Add, Visibility, Delete, Publish } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchRFQs, createRFQ, deleteRFQ } from '../store/slices/rfqSlice'
import { fetchVendors } from '../store/slices/vendorSlice'
import { format } from 'date-fns'
import api from '../services/api'

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  requiredDate: z.string().min(1, 'Required date needed'),
  deadline: z.string().min(1, 'Deadline needed'),
  vendorIds: z.array(z.string()).min(1, 'Select at least one vendor'),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name required'),
    quantity: z.number().min(1, 'Quantity > 0'),
    unit: z.string().min(1, 'Unit required'),
  })).min(1, 'Add at least one item'),
})
type FormData = z.infer<typeof schema>

const RFQList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { rfqs, loading } = useSelector((state: RootState) => state.rfq)
  const { vendors } = useSelector((state: RootState) => state.vendors)
  const [open, setOpen] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { vendorIds: [], items: [{ name: '', quantity: 1, unit: 'pcs' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    dispatch(fetchRFQs())
    dispatch(fetchVendors())
  }, [dispatch])

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createRFQ({
        ...data,
        requiredDate: new Date(data.requiredDate).toISOString(),
        deadline: new Date(data.deadline).toISOString(),
      })).unwrap()
      setOpen(false)
      reset()
      dispatch(fetchRFQs())
    } catch (err) {
      console.error('Failed to create RFQ:', err)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      dispatch(deleteRFQ(id)).unwrap().catch(err => {
        console.error('Failed to delete RFQ:', err)
      })
    }
  }

  const handlePublish = async (id: string) => {
    try {
      setPublishing(id)
      await api.post(`/rfq/${id}/publish`)
      dispatch(fetchRFQs())
    } catch (err) {
      console.error('Failed to publish RFQ:', err)
    } finally {
      setPublishing(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">RFQs</Typography>
          <Typography>Request for Quotations</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          Create RFQ
        </Button>
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table className="vb-table">
              <TableHead>
                <TableRow>
                  <TableCell>RFQ Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Vendors Invited</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rfqs.map((rfq: any) => (
                  <TableRow key={rfq.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{rfq.rfqNumber}</TableCell>
                    <TableCell>{rfq.title}</TableCell>
                    <TableCell>{format(new Date(rfq.deadline), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{rfq.vendors?.length || 0}</TableCell>
                    <TableCell align="center">
                      <span className={`status-badge badge-${rfq.status.toLowerCase()}`}>
                        {rfq.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {rfq.status === 'DRAFT' && (
                        <Tooltip title="Publish">
                          <IconButton size="small" color="primary" onClick={() => handlePublish(rfq.id)} disabled={publishing === rfq.id}>
                            {publishing === rfq.id ? <CircularProgress size={16} /> : <Publish fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/rfq/${rfq.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(rfq.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {rfqs.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No RFQs found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New RFQ</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="title" control={control}
              render={({ field }) => <TextField {...field} label="RFQ Title" fullWidth size="small" error={!!errors.title} helperText={errors.title?.message} />}
            />
            <Controller
              name="description" control={control}
              render={({ field }) => <TextField {...field} label="Description" fullWidth multiline rows={2} size="small" />}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="requiredDate" control={control}
                render={({ field }) => <TextField {...field} label="Required By" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" error={!!errors.requiredDate} helperText={errors.requiredDate?.message} />}
              />
              <Controller
                name="deadline" control={control}
                render={({ field }) => <TextField {...field} label="Submission Deadline" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" error={!!errors.deadline} helperText={errors.deadline?.message} />}
              />
            </Box>

            <FormControl fullWidth size="small" error={!!errors.vendorIds}>
              <InputLabel>Select Vendors</InputLabel>
              <Controller
                name="vendorIds" control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    input={<OutlinedInput label="Select Vendors" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={vendors.find(v => v.id === value)?.companyName || value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {vendors.filter(v => v.status === 'ACTIVE').map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.companyName} (Rating: {Math.round(vendor.ratingScore)}%)
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Items List</Typography>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Controller
                  name={`items.${index}.name`} control={control}
                  render={({ field }) => <TextField {...field} label="Item Name" size="small" fullWidth error={!!errors.items?.[index]?.name} />}
                />
                <Controller
                  name={`items.${index}.quantity`} control={control}
                  render={({ field }) => <TextField {...field} label="Qty" type="number" size="small" sx={{ width: 100 }} error={!!errors.items?.[index]?.quantity} onChange={e => field.onChange(parseInt(e.target.value))} />}
                />
                <Controller
                  name={`items.${index}.unit`} control={control}
                  render={({ field }) => <TextField {...field} label="Unit" size="small" sx={{ width: 100 }} error={!!errors.items?.[index]?.unit} />}
                />
                <IconButton color="error" onClick={() => remove(index)} sx={{ mt: 0.5 }} disabled={fields.length === 1}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Add />} onClick={() => append({ name: '', quantity: 1, unit: 'pcs' })} sx={{ alignSelf: 'flex-start' }}>
              Add Item
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
            Create Draft RFQ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RFQList

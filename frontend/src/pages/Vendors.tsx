import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import { Add, Edit, Delete, Star } from '@mui/icons-material'
import { AppDispatch, RootState } from '../store/store'
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../store/slices/vendorSlice'
import { format } from 'date-fns'

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/, 'Invalid GST format (e.g., 22AAAAA0000A1Z5)'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number required'),
  category: z.string().min(2, 'Category required'),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const Vendors = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { vendors, loading } = useSelector((state: RootState) => state.vendors)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  const handleOpen = (vendor?: any) => {
    if (vendor) {
      setEditId(vendor.id)
      reset(vendor)
    } else {
      setEditId(null)
      reset({ companyName: '', gstNumber: '', email: '', phone: '', category: '', address: '' })
    }
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      dispatch(deleteVendor(id))
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (editId) {
        await dispatch(updateVendor({ id: editId, data })).unwrap()
      } else {
        await dispatch(createVendor(data)).unwrap()
      }
      setOpen(false)
      reset()
    } catch (err) {
      console.error(err)
    }
  }

  const renderStars = (score: number) => {
    const stars = Math.round((score / 100) * 5)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} sx={{ fontSize: 16, color: i < stars ? '#f59e0b' : '#334155' }} />
        ))}
        <Typography sx={{ ml: 0.5, fontSize: 12, fontWeight: 600, color: 'text.primary' }}>{Math.round(score)}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box className="page-header" sx={{ mb: 0 }}>
          <Typography variant="h1">Vendors</Typography>
          <Typography>Manage vendor profiles and ratings</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          Add Vendor
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
                  <TableCell>Company Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>GST Number</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map(vendor => (
                  <TableRow key={vendor.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{vendor.companyName}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13 }}>{vendor.email}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{vendor.phone}</Typography>
                    </TableCell>
                    <TableCell>{vendor.category}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{vendor.gstNumber}</TableCell>
                    <TableCell>{renderStars(vendor.ratingScore)}</TableCell>
                    <TableCell align="center">
                      <span className={`status-badge badge-${vendor.status.toLowerCase()}`}>
                        {vendor.status}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(vendor)}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(vendor.id)}><Delete fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {vendors.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No vendors found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="companyName" control={control}
              render={({ field }) => <TextField {...field} label="Company Name" fullWidth size="small" error={!!errors.companyName} helperText={errors.companyName?.message} />}
            />
            <Controller
              name="gstNumber" control={control}
              render={({ field }) => <TextField {...field} label="GST Number" fullWidth size="small" error={!!errors.gstNumber} helperText={errors.gstNumber?.message} />}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="email" control={control}
                render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth size="small" error={!!errors.email} helperText={errors.email?.message} />}
              />
              <Controller
                name="phone" control={control}
                render={({ field }) => <TextField {...field} label="Phone" fullWidth size="small" error={!!errors.phone} helperText={errors.phone?.message} />}
              />
            </Box>
            <Controller
              name="category" control={control}
              render={({ field }) => (
                <TextField {...field} label="Category" select fullWidth size="small" error={!!errors.category} helperText={errors.category?.message}>
                  <MenuItem value="IT_SERVICES">IT Services</MenuItem>
                  <MenuItem value="HARDWARE">Hardware</MenuItem>
                  <MenuItem value="OFFICE_SUPPLIES">Office Supplies</MenuItem>
                  <MenuItem value="CONSULTING">Consulting</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="address" control={control}
              render={({ field }) => <TextField {...field} label="Address" fullWidth multiline rows={2} size="small" />}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
            Save Vendor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Vendors

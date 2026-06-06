import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Vendor {
  id: string
  companyName: string
  gstNumber: string
  email: string
  phone: string
  category: string
  status: string
  ratingScore: number
}

interface VendorState {
  vendors: Vendor[]
  loading: boolean
  error: string | null
}

const initialState: VendorState = {
  vendors: [],
  loading: false,
  error: null,
}

export const fetchVendors = createAsyncThunk('vendors/fetchVendors', async () => {
  const response = await api.get('/vendors')
  return response.data
})

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendorData: Partial<Vendor>) => {
    const response = await api.post('/vendors', vendorData)
    return response.data
  }
)

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
    const response = await api.put(`/vendors/${id}`, data)
    return response.data
  }
)

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (id: string) => {
    await api.delete(`/vendors/${id}`)
    return id
  }
)

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false
        state.vendors = action.payload
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch vendors'
      })
      .addCase(createVendor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false
        state.vendors.push(action.payload)
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create vendor'
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id)
        if (index !== -1) {
          state.vendors[index] = action.payload
        }
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(v => v.id !== action.payload)
      })
  },
})

export const { clearError } = vendorSlice.actions
export default vendorSlice.reducer

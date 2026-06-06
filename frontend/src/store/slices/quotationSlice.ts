import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Quotation {
  id: string
  quotationNumber: string
  vendorId: string
  grandTotal: number
  status: string
}

interface QuotationState {
  quotations: Quotation[]
  loading: boolean
  error: string | null
}

const initialState: QuotationState = {
  quotations: [],
  loading: false,
  error: null,
}

export const fetchQuotations = createAsyncThunk('quotations/fetchQuotations', async () => {
  const token = localStorage.getItem('token')
  const response = await axios.get('http://localhost:3000/api/quotation', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
})

const quotationSlice = createSlice({
  name: 'quotations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false
        state.quotations = action.payload
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch quotations'
      })
  },
})

export const { clearError } = quotationSlice.actions
export default quotationSlice.reducer

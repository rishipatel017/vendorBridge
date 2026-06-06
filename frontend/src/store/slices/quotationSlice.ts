import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

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
  const response = await api.get('/quotation')
  return response.data
})

export const submitQuotation = createAsyncThunk('quotations/submit', async (id: string) => {
  const response = await api.post(`/quotation/${id}/submit`)
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
      .addCase(submitQuotation.fulfilled, (state, action) => {
        const idx = state.quotations.findIndex(q => q.id === action.payload.id)
        if (idx !== -1) state.quotations[idx] = action.payload
      })
  },
})

export const { clearError } = quotationSlice.actions
export default quotationSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { Invoice } from '../../types'

interface InvoiceState {
  invoices: Invoice[]
  loading: boolean
  error: string | null
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
}

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async () => {
  const res = await api.get('/invoice')
  return res.data
})

export const generateInvoice = createAsyncThunk('invoices/generate', async (poId: string) => {
  const res = await api.post(`/invoice/po/${poId}`)
  return res.data
})

export const sendInvoice = createAsyncThunk('invoices/send', async (id: string) => {
  const res = await api.post(`/invoice/${id}/send`)
  return res.data
})

export const markInvoicePaid = createAsyncThunk('invoices/markPaid', async (id: string) => {
  const res = await api.post(`/invoice/${id}/mark-paid`)
  return res.data
})

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchInvoices.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload })
      .addCase(fetchInvoices.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
  },
})

export const { clearError } = invoiceSlice.actions
export default invoiceSlice.reducer

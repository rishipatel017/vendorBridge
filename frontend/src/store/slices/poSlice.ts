import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { PurchaseOrder } from '../../types'

interface POState {
  pos: PurchaseOrder[]
  loading: boolean
  error: string | null
}

const initialState: POState = {
  pos: [],
  loading: false,
  error: null,
}

export const fetchPOs = createAsyncThunk('po/fetchAll', async () => {
  const res = await api.get('/po')
  return res.data
})

export const createPO = createAsyncThunk('po/create', async (quotationId: string) => {
  const res = await api.post(`/po/quotation/${quotationId}`)
  return res.data
})

export const sendPO = createAsyncThunk('po/send', async (id: string) => {
  const res = await api.post(`/po/${id}/send`)
  return res.data
})

export const acceptPO = createAsyncThunk('po/accept', async (id: string) => {
  const res = await api.post(`/po/${id}/accept`)
  return res.data
})

export const deliverPO = createAsyncThunk('po/deliver', async (id: string) => {
  const res = await api.post(`/po/${id}/deliver`)
  return res.data
})

export const closePO = createAsyncThunk('po/close', async (id: string) => {
  const res = await api.post(`/po/${id}/close`)
  return res.data
})

const poSlice = createSlice({
  name: 'po',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPOs.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPOs.fulfilled, (state, action) => { state.loading = false; state.pos = action.payload })
      .addCase(fetchPOs.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
  },
})

export const { clearError } = poSlice.actions
export default poSlice.reducer

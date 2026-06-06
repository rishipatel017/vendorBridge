import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

interface RFQ {
  id: string
  rfqNumber: string
  title: string
  status: string
  requiredDate: string
  deadline: string
}

interface RFQState {
  rfqs: RFQ[]
  loading: boolean
  error: string | null
}

const initialState: RFQState = {
  rfqs: [],
  loading: false,
  error: null,
}

export const fetchRFQs = createAsyncThunk('rfq/fetchRFQs', async () => {
  const response = await api.get('/rfq')
  return response.data
})

export const createRFQ = createAsyncThunk(
  'rfq/createRFQ',
  async (rfqData: Partial<RFQ>) => {
    const response = await api.post('/rfq', rfqData)
    return response.data
  }
)

export const deleteRFQ = createAsyncThunk(
  'rfq/deleteRFQ',
  async (id: string) => {
    await api.delete(`/rfq/${id}`)
    return id
  }
)

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false
        state.rfqs = action.payload
      })
      .addCase(fetchRFQs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch RFQs'
      })
      .addCase(createRFQ.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRFQ.fulfilled, (state, action) => {
        state.loading = false
        state.rfqs.push(action.payload)
      })
      .addCase(createRFQ.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create RFQ'
      })
      .addCase(deleteRFQ.fulfilled, (state, action) => {
        state.rfqs = state.rfqs.filter(r => r.id !== action.payload)
      })
  },
})

export const { clearError } = rfqSlice.actions
export default rfqSlice.reducer

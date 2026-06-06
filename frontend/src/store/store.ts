import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import vendorReducer from './slices/vendorSlice'
import rfqReducer from './slices/rfqSlice'
import quotationReducer from './slices/quotationSlice'
import poReducer from './slices/poSlice'
import invoiceReducer from './slices/invoiceSlice'
import approvalReducer from './slices/approvalSlice'
import reportReducer from './slices/reportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendors: vendorReducer,
    rfq: rfqReducer,
    quotations: quotationReducer,
    po: poReducer,
    invoices: invoiceReducer,
    approvals: approvalReducer,
    reports: reportReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

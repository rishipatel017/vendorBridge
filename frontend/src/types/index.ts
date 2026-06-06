// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'VENDOR' | 'MANAGER'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

// ─── Vendor ───────────────────────────────────────────────────────────────────
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Vendor {
  id: string
  companyName: string
  gstNumber: string
  email: string
  phone: string
  address?: string
  category: string
  status: VendorStatus
  deliveryScore: number
  qualityScore: number
  responseScore: number
  ratingScore: number
  completedOrders: number
  totalOrders: number
  createdAt: string
  updatedAt: string
}

// ─── RFQ ─────────────────────────────────────────────────────────────────────
export type RFQStatus = 'DRAFT' | 'PUBLISHED' | 'QUOTATION_RECEIVED' | 'UNDER_REVIEW' | 'CLOSED'

export interface RFQItem {
  id: string
  rfqId: string
  name: string
  description?: string
  quantity: number
  unit: string
}

export interface RFQVendor {
  id: string
  rfqId: string
  vendorId: string
  vendor: Vendor
  sentAt: string
}

export interface RFQ {
  id: string
  rfqNumber: string
  title: string
  description?: string
  requiredDate: string
  deadline: string
  status: RFQStatus
  createdBy: string
  creator?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  items: RFQItem[]
  vendors: RFQVendor[]
  quotations?: Quotation[]
  createdAt: string
  updatedAt: string
}

// ─── Quotation ────────────────────────────────────────────────────────────────
export type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'

export interface QuotationItem {
  id: string
  quotationId: string
  rfqItemId: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  rfqId: string
  vendorId: string
  status: QuotationStatus
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  shippingCharges: number
  grandTotal: number
  deliveryDays: number
  remarks?: string
  submittedAt?: string
  rfq?: Pick<RFQ, 'id' | 'rfqNumber' | 'title'>
  vendor?: Vendor
  items: QuotationItem[]
  approval?: Approval
  // Computed
  isLowest?: boolean
  score?: number
  createdAt: string
  updatedAt: string
}

// ─── Approval ─────────────────────────────────────────────────────────────────
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type ApprovalLevel = 'SINGLE' | 'MANAGER' | 'MANAGER_ADMIN'

export interface Approval {
  id: string
  quotationId: string
  approverId: string
  status: ApprovalStatus
  level: ApprovalLevel
  remarks?: string
  approvedAt?: string
  deadline: string
  quotation?: Quotation
  approver?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  createdAt: string
  updatedAt: string
}

// ─── Purchase Order ───────────────────────────────────────────────────────────
export type POStatus = 'CREATED' | 'SENT' | 'ACCEPTED' | 'DELIVERED' | 'CLOSED'

export interface POItem {
  id: string
  poId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  quotationId: string
  vendorId: string
  status: POStatus
  subtotal: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  grandTotal: number
  sentAt?: string
  acceptedAt?: string
  deliveredAt?: string
  remarks?: string
  quotation?: Pick<Quotation, 'id' | 'quotationNumber'>
  vendor?: Vendor
  items: POItem[]
  invoices?: Invoice[]
  createdAt: string
  updatedAt: string
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'GENERATED' | 'SENT' | 'PAID' | 'CANCELLED'

export interface InvoiceItem {
  id: string
  invoiceId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  poId: string
  vendorId: string
  status: InvoiceStatus
  taxableAmount: number
  gstPercent: number
  gstAmount: number
  totalAmount: number
  dueDate?: string
  paidAt?: string
  sentAt?: string
  emailStatus?: string
  remarks?: string
  po?: Pick<PurchaseOrder, 'id' | 'poNumber'>
  vendor?: Vendor
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export interface ActivityLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  createdAt: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardKPIs {
  totalVendors: number
  activeRFQs: number
  pendingApprovals: number
  totalProcurement: number
}

export interface MonthlySpend {
  month: string
  amount: number
}

export interface VendorPerformance {
  id: string
  companyName: string
  ratingScore: number
  completedOrders: number
  totalOrders: number
  performanceRate: number
}

export interface DashboardData {
  kpis: DashboardKPIs
  monthlySpending: MonthlySpend[]
  recentPOs: PurchaseOrder[]
  vendorPerformance: VendorPerformance[]
  recentActivity: ActivityLog[]
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

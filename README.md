# VendorBridge - Procurement & Vendor Management ERP

An enterprise-grade procurement ERP system that manages the complete Procure-to-Pay lifecycle: Vendor Registration → RFQ → Quotation → Evaluation → Approval → Purchase Order → Invoice → Payment Tracking → Analytics.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js with NestJS Framework
- MySQL 8.x Database
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React.js + TypeScript
- Material UI (MUI)
- Tailwind CSS
- React Hook Form + Zod
- Redux Toolkit
- Recharts for analytics
- Axios for API calls

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL 8.x
- npm or yarn

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
cd vendorBridge
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/vendorbridge"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development

# Email (optional - for invoice emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=VendorBridge ERP <noreply@vendorbridge.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Approval SLA (in days)
APPROVAL_SLA_DAYS=3
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Start the backend server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

Navigate to the frontend directory (in a new terminal):

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📊 Database Schema

The database includes the following main entities:

- **Users** - System users with role-based access (Admin, Procurement Officer, Vendor, Manager)
- **Vendors** - Vendor profiles with GST validation and rating system
- **RFQ** - Request for Quotation with status workflow
- **Quotations** - Vendor quotations with automatic calculations
- **Approvals** - Multi-level approval workflow with SLA
- **Purchase Orders** - PO generation from approved quotations
- **Invoices** - Invoice generation with PDF support
- **Activity Logs** - Complete audit trail
- **Notifications** - System notifications

## 🔐 Authentication

The system uses JWT-based authentication with the following features:

- Password hashing with bcrypt
- Access tokens (15 minutes expiration)
- Role-based access control (RBAC)
- Protected routes with guards

### Default Roles

- **ADMIN** - Full system access, user management
- **PROCUREMENT_OFFICER** - Create RFQ, manage vendors, generate PO
- **VENDOR** - View RFQ, submit quotations
- **MANAGER** - Approve/reject quotations

## 🎯 Key Features

### Vendor Management
- GST validation (format: 22AAAAA0000A1Z5)
- Vendor rating formula: (Delivery × 40%) + (Quality × 40%) + (Response × 20%)
- Vendor status management (ACTIVE, INACTIVE, BLOCKED)

### RFQ Module
- Auto-generated RFQ numbers: RFQ-{YEAR}-{SEQUENCE}
- Status workflow: DRAFT → PUBLISHED → QUOTATION_RECEIVED → UNDER_REVIEW → CLOSED
- Validation before publishing (items required, vendors assigned, deadline valid)

### Quotation Module
- Automatic calculations (subtotal, discount, tax, grand total)
- Quotation comparison with scoring
- Status tracking (DRAFT → SUBMITTED → ACCEPTED/REJECTED)

### Approval Workflow
- Multi-level approval based on PO value:
  - Below ₹50,000: Single approval
  - ₹50,000 - ₹5,00,000: Manager approval
  - Above ₹5,00,000: Manager + Admin approval
- SLA tracking (configurable days)
- Approval deadline calculation

### Purchase Order
- PO generation only after approval
- Auto-generated PO numbers: PO-{YEAR}-{SEQUENCE}
- Status tracking: CREATED → SENT → ACCEPTED → DELIVERED → CLOSED

### Invoice Module
- Invoice generation from PO
- Auto-generated invoice numbers: INV-{YEAR}-{SEQUENCE}
- GST calculation
- PDF generation (to be implemented)
- Email integration (to be implemented)

### Reports & Analytics
- Vendor reports
- Purchase reports
- Invoice reports
- Spend analysis
- Export to Excel/PDF (to be implemented)

### Audit Logging
- Complete audit trail for all actions
- User, action, entity, timestamp tracking
- Old value/new value comparison

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor (Admin only)

### RFQ
- `GET /api/rfq` - List all RFQs
- `GET /api/rfq/:id` - Get RFQ by ID
- `POST /api/rfq` - Create RFQ
- `PUT /api/rfq/:id` - Update RFQ
- `POST /api/rfq/:id/publish` - Publish RFQ
- `DELETE /api/rfq/:id` - Delete RFQ

### Quotations
- `GET /api/quotation` - List all quotations
- `GET /api/quotation/rfq/:rfqId` - Get quotations by RFQ
- `GET /api/quotation/:id` - Get quotation by ID
- `POST /api/quotation` - Create quotation (Vendor only)
- `PUT /api/quotation/:id` - Update quotation (Vendor only)
- `POST /api/quotation/:id/submit` - Submit quotation (Vendor only)

### Approvals
- `GET /api/approval` - List all approvals
- `GET /api/approval/pending` - List pending approvals
- `GET /api/approval/:id` - Get approval by ID
- `POST /api/approval/:id/approve` - Approve quotation
- `POST /api/approval/:id/reject` - Reject quotation

### Purchase Orders
- `GET /api/po` - List all POs
- `GET /api/po/:id` - Get PO by ID
- `POST /api/po/quotation/:quotationId` - Create PO from quotation
- `POST /api/po/:id/send` - Send PO to vendor

### Invoices
- `GET /api/invoice` - List all invoices
- `GET /api/invoice/:id` - Get invoice by ID
- `POST /api/invoice/po/:poId` - Create invoice from PO
- `POST /api/invoice/:id/send` - Send invoice
- `POST /api/invoice/:id/mark-paid` - Mark invoice as paid

### Reports
- `GET /api/reports/vendor` - Vendor report
- `GET /api/reports/purchase` - Purchase report
- `GET /api/reports/invoice` - Invoice report
- `GET /api/reports/spend-analysis` - Spend analysis

### Audit
- `GET /api/audit` - List all activity logs (Admin only)
- `GET /api/audit/entity/:entity/:entityId` - Get logs by entity
- `GET /api/audit/user/:userId` - Get logs by user

## 🔧 Development Scripts

### Backend
```bash
npm run start:dev    # Start in development mode
npm run build        # Build for production
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm run test
```

Run e2e tests:
```bash
cd backend
npm run test:e2e
```

## 📝 Notes

- The lint errors shown in the IDE are expected until npm packages are installed
- Run `npx prisma generate` after installing dependencies to resolve Prisma-related errors
- The frontend implementation is pending and will be added in the next phase
- PDF generation and email integration for invoices are marked as TODO in the code
- Security features (rate limiting, input sanitization) need to be implemented

## 🤝 Contributing

This is a comprehensive ERP system following SOLID principles, Clean Code, DRY, and the Repository Pattern.

## 📄 License

UNLICENSED - Private project

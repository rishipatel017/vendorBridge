import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeder...');

  // 1. Create Users (Admin, Manager, Procurement Officer, Vendor)
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vendorbridge.com' },
    update: {},
    create: {
      email: 'admin@vendorbridge.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@vendorbridge.com' },
    update: {},
    create: {
      email: 'manager@vendorbridge.com',
      password: passwordHash,
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'MANAGER',
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: 'officer@vendorbridge.com' },
    update: {},
    create: {
      email: 'officer@vendorbridge.com',
      password: passwordHash,
      firstName: 'Procurement',
      lastName: 'Officer',
      role: 'PROCUREMENT_OFFICER',
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@techsupply.com' },
    update: {},
    create: {
      email: 'vendor@techsupply.com',
      password: passwordHash,
      firstName: 'Tech',
      lastName: 'Supplier',
      role: 'VENDOR',
    },
  });

  console.log('Users created.');

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      companyName: 'Tech Supply Co.',
      gstNumber: '22AAAAA0000A1Z5',
      email: 'contact@techsupply.com',
      phone: '9876543210',
      address: '123 Tech Park, Bangalore',
      category: 'IT_SERVICES',
      status: 'ACTIVE',
      ratingScore: 92.5,
      totalOrders: 10,
      completedOrders: 9,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      companyName: 'Office Essentials Ltd.',
      gstNumber: '33BBBBB1111B2Y6',
      email: 'sales@officeessentials.com',
      phone: '8765432109',
      address: '45 Commerce Street, Mumbai',
      category: 'OFFICE_SUPPLIES',
      status: 'ACTIVE',
      ratingScore: 88.0,
      totalOrders: 5,
      completedOrders: 4,
    },
  });

  console.log('Vendors created.');

  // 3. Create RFQ
  const rfqDate = new Date();
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 7);

  const rfq = await prisma.rFQ.create({
    data: {
      rfqNumber: 'RFQ-2026-00001',
      title: 'Laptops for Engineering Team',
      description: 'Require 50 high-performance laptops for the new engineering hires.',
      requiredDate: deadlineDate,
      deadline: deadlineDate,
      status: 'UNDER_REVIEW',
      createdBy: officer.id,
      items: {
        create: [
          { name: 'MacBook Pro 16" M3 Max', quantity: 10, unit: 'pcs' },
          { name: 'ThinkPad X1 Carbon Gen 11', quantity: 40, unit: 'pcs' },
        ],
      },
      vendors: {
        create: [
          { vendorId: vendor1.id },
        ],
      },
    },
    include: { items: true },
  });

  console.log('RFQ created.');

  // 4. Create Quotation
  const subtotal = 10 * 300000 + 40 * 150000;
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-00001',
      rfqId: rfq.id,
      vendorId: vendor1.id,
      status: 'SUBMITTED',
      subtotal,
      taxPercent: 18,
      taxAmount: tax,
      grandTotal,
      deliveryDays: 14,
      items: {
        create: [
          { rfqItemId: (rfq as any).items[0].id, quantity: 10, unitPrice: 300000, lineTotal: 3000000 },
          { rfqItemId: (rfq as any).items[1].id, quantity: 40, unitPrice: 150000, lineTotal: 6000000 },
        ],
      },
    },
  });

  console.log('Quotation created.');

  // 5. Create Approval
  const approvalDeadline = new Date();
  approvalDeadline.setDate(approvalDeadline.getDate() + 2);

  const approval = await prisma.approval.create({
    data: {
      quotationId: quotation.id,
      approverId: manager.id,
      status: 'PENDING',
      level: 'MANAGER',
      deadline: approvalDeadline,
    },
  });

  console.log('Approval created.');

  // 6. Create PO (From a previously approved quotation to show varied data)
  const pastQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-00000',
      rfqId: rfq.id, // Reusing RFQ for simplicity
      vendorId: vendor2.id,
      status: 'ACCEPTED',
      subtotal: 50000,
      taxPercent: 18,
      taxAmount: 9000,
      grandTotal: 59000,
      deliveryDays: 5,
    },
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-00001',
      quotationId: pastQuotation.id,
      vendorId: vendor2.id,
      status: 'DELIVERED',
      subtotal: 50000,
      taxPercent: 18,
      taxAmount: 9000,
      grandTotal: 59000,
      items: {
        create: [
          { name: 'Office Chairs', quantity: 10, unitPrice: 5000, lineTotal: 50000 },
        ],
      },
    },
  });

  console.log('Purchase Order created.');

  // 7. Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      poId: po.id,
      vendorId: vendor2.id,
      status: 'SENT',
      taxableAmount: 50000,
      gstPercent: 18,
      gstAmount: 9000,
      totalAmount: 59000,
      items: {
        create: [
          { name: 'Office Chairs', quantity: 10, unitPrice: 5000, lineTotal: 50000 },
        ],
      },
    },
  });

  console.log('Invoice created.');

  // 8. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'CREATED', entity: 'VENDOR', entityId: vendor1.id },
      { userId: officer.id, action: 'PUBLISHED', entity: 'RFQ', entityId: rfq.id },
      { userId: vendorUser.id, action: 'SUBMITTED', entity: 'QUOTATION', entityId: quotation.id },
      { userId: officer.id, action: 'REQUESTED_APPROVAL', entity: 'QUOTATION', entityId: quotation.id },
    ],
  });

  console.log('Activity logs created.');
  console.log('Database seeding completed successfully.');
  console.log('Login credentials:');
  console.log('Admin: admin@vendorbridge.com / Password@123');
  console.log('Officer: officer@vendorbridge.com / Password@123');
  console.log('Manager: manager@vendorbridge.com / Password@123');
  console.log('Vendor: vendor@techsupply.com / Password@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

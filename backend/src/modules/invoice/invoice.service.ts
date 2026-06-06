import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  // Invoice Number Logic: INV-{YEAR}-{SEQUENCE}
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
    });
    const sequence = String(count + 1).padStart(5, '0');
    return `INV-${year}-${sequence}`;
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        po: {
          include: {
            vendor: true,
          },
        },
        vendor: true,
        items: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        po: {
          include: {
            items: true,
          },
        },
        vendor: true,
        items: true,
      },
    });
  }

  async createFromPO(poId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: true,
        vendor: true,
      },
    });

    if (!po) {
      throw new BadRequestException('Purchase Order not found');
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    // Invoice Calculation
    const taxableAmount = po.subtotal - po.discountAmount;
    const gstAmount = taxableAmount * (po.taxPercent / 100);
    const totalAmount = taxableAmount + gstAmount;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        poId,
        vendorId: po.vendorId,
        status: InvoiceStatus.GENERATED,
        taxableAmount,
        gstPercent: po.taxPercent,
        gstAmount,
        totalAmount,
        items: {
          create: po.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return invoice;
  }

  async send(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });

    if (invoice.status !== InvoiceStatus.GENERATED) {
      throw new BadRequestException('Invoice must be in GENERATED status to send');
    }

    // TODO: Generate PDF and send email
    // This would involve:
    // 1. Generate PDF using pdfkit
    // 2. Upload to storage
    // 3. Send email via nodemailer
    // 4. Update email status

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
        sentAt: new Date(),
        emailStatus: 'SENT',
      },
    });
  }

  async markPaid(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });

    if (invoice.status !== InvoiceStatus.SENT) {
      throw new BadRequestException('Invoice must be sent before marking as paid');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });
  }
}

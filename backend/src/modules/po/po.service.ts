import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { POStatus } from '@prisma/client';

@Injectable()
export class POService {
  constructor(private prisma: PrismaService) {}

  // PO Number Logic: PO-{YEAR}-{SEQUENCE}
  private async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.purchaseOrder.count({
      where: { poNumber: { startsWith: `PO-${year}-` } },
    });
    const sequence = String(count + 1).padStart(5, '0');
    return `PO-${year}-${sequence}`;
  }

  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        quotation: { select: { quotationNumber: true } },
        vendor: true,
        items: true,
        invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            rfq: { include: { items: true } },
            items: true,
          },
        },
        vendor: true,
        items: true,
        invoices: true,
      },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async createFromQuotation(quotationId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        approval: true,
        items: {
          include: { rfqItem: true },
        },
      },
    });

    if (!quotation) throw new NotFoundException('Quotation not found');

    if (!quotation.approval || quotation.approval.status !== 'APPROVED') {
      throw new BadRequestException('Quotation must be approved before creating PO');
    }

    // Check PO doesn't already exist
    const existing = await this.prisma.purchaseOrder.findUnique({
      where: { quotationId },
    });
    if (existing) throw new BadRequestException('PO already exists for this quotation');

    const poNumber = await this.generatePONumber();

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        quotationId,
        vendorId: quotation.vendorId,
        status: POStatus.CREATED,
        subtotal: quotation.subtotal,
        discountPercent: quotation.discountPercent,
        discountAmount: quotation.discountAmount,
        taxPercent: quotation.taxPercent,
        taxAmount: quotation.taxAmount,
        grandTotal: quotation.grandTotal,
        items: {
          create: quotation.items.map(item => ({
            name: item.rfqItem?.name || 'Item',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true, vendor: true },
    });

    // Update quotation status to ACCEPTED
    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'ACCEPTED' },
    });

    // Update vendor totalOrders
    await this.prisma.vendor.update({
      where: { id: quotation.vendorId },
      data: { totalOrders: { increment: 1 } },
    });

    return po;
  }

  async send(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== POStatus.CREATED) {
      throw new BadRequestException('PO must be in CREATED status to send');
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.SENT, sentAt: new Date() },
    });
  }

  async accept(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== POStatus.SENT) {
      throw new BadRequestException('PO must be in SENT status to accept');
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }

  async deliver(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== POStatus.ACCEPTED) {
      throw new BadRequestException('PO must be ACCEPTED before marking delivered');
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.DELIVERED, deliveredAt: new Date() },
    });
  }

  async close(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true },
    });
    if (!po) throw new NotFoundException('PO not found');
    if (po.status !== POStatus.DELIVERED) {
      throw new BadRequestException('PO must be DELIVERED before closing');
    }

    // Update vendor completedOrders
    await this.prisma.vendor.update({
      where: { id: po.vendorId },
      data: { completedOrders: { increment: 1 } },
    });

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.CLOSED },
    });
  }

  async updateRemarks(id: string, remarks: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { remarks },
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QuotationStatus } from '@prisma/client';

@Injectable()
export class QuotationService {
  constructor(private prisma: PrismaService) {}

  // Quotation Number Generation
  private async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quotation.count({
      where: {
        quotationNumber: {
          startsWith: `QT-${year}-`,
        },
      },
    });
    const sequence = String(count + 1).padStart(5, '0');
    return `QT-${year}-${sequence}`;
  }

  // Quotation Calculations
  private calculateQuotationTotals(items: any[], discountPercent: number, taxPercent: number, shippingCharges: number) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const grandTotal = taxableAmount + taxAmount + shippingCharges;

    return { subtotal, discountAmount, taxableAmount, taxAmount, grandTotal };
  }

  // Quotation Comparison Logic
  async compareQuotations(rfqId: string) {
    const quotations = await this.prisma.quotation.findMany({
      where: { rfqId, status: QuotationStatus.SUBMITTED },
      orderBy: { grandTotal: 'asc' },
    });

    const lowestPrice = quotations.length > 0 ? quotations[0].grandTotal : null;

    return quotations.map(q => ({
      ...q,
      isLowest: q.grandTotal === lowestPrice,
      score: this.calculateScore(q.grandTotal, q.deliveryDays, 80),
    }));
  }

  private calculateScore(price: number, deliveryDays: number, qualityScore: number): number {
    const priceWeight = 0.5;
    const deliveryWeight = 0.3;
    const qualityWeight = 0.2;

    const maxPrice = 1000000; // Adjust based on your business
    const maxDeliveryDays = 30;

    const priceScore = (1 - price / maxPrice) * 100;
    const deliveryScore = (1 - deliveryDays / maxDeliveryDays) * 100;

    return (priceScore * priceWeight) + (deliveryScore * deliveryWeight) + (qualityScore * qualityWeight);
  }

  async findAll() {
    return this.prisma.quotation.findMany({
      include: {
        rfq: true,
        vendor: true,
        items: true,
        approval: true,
      },
    });
  }

  async findByRFQ(rfqId: string) {
    return this.prisma.quotation.findMany({
      where: { rfqId },
      include: {
        vendor: true,
        items: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: {
          include: {
            items: true,
          },
        },
        vendor: true,
        items: true,
        approval: true,
      },
    });
  }

  async create(dto: any, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const vendor = await this.prisma.vendor.findFirst({
      where: { email: user?.email },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor profile not found');
    }

    const quotationNumber = await this.generateQuotationNumber();
    const { items, ...quotationData } = dto;

    const totals = this.calculateQuotationTotals(
      items,
      quotationData.discountPercent || 0,
      quotationData.taxPercent || 0,
      quotationData.shippingCharges || 0,
    );

    const quotation = await this.prisma.quotation.create({
      data: {
        ...quotationData,
        ...totals,
        quotationNumber,
        rfqId: dto.rfqId,
        vendorId: vendor.id,
        status: QuotationStatus.DRAFT,
        items: {
          create: items.map((item: any) => ({
            rfqItemId: item.rfqItemId,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return quotation;
  }

  async update(id: string, dto: any) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } });

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Can only update DRAFT quotations');
    }

    const { items, ...quotationData } = dto;

    let totals = {};
    if (items || quotationData.discountPercent !== undefined || quotationData.taxPercent !== undefined) {
      const currentItems = items || await this.prisma.quotationItem.findMany({ where: { quotationId: id } });
      totals = this.calculateQuotationTotals(
        currentItems,
        quotationData.discountPercent ?? quotation.discountPercent,
        quotationData.taxPercent ?? quotation.taxPercent,
        quotationData.shippingCharges ?? quotation.shippingCharges,
      );
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        ...quotationData,
        ...totals,
        items: items ? { deleteMany: {}, create: items.map((item: any) => ({
          rfqItemId: item.rfqItemId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.quantity * item.unitPrice,
        })) } : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async submit(id: string) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } });

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Can only submit DRAFT quotations');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });
  }
}

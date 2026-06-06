import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RFQStatus } from '@prisma/client';

@Injectable()
export class RFQService {
  constructor(private prisma: PrismaService) {}

  // RFQ Number Logic: RFQ-{YEAR}-{SEQUENCE}
  private async generateRFQNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.rFQ.count({
      where: {
        rfqNumber: {
          startsWith: `RFQ-${year}-`,
        },
      },
    });
    const sequence = String(count + 1).padStart(5, '0');
    return `RFQ-${year}-${sequence}`;
  }

  async findAll() {
    return this.prisma.rFQ.findMany({
      include: {
        items: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.rFQ.findUnique({
      where: { id },
      include: {
        items: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        quotations: true,
      },
    });
  }

  async create(dto: any, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('RFQ must have at least one item');
    }

    if (!dto.vendorIds || dto.vendorIds.length === 0) {
      throw new BadRequestException('RFQ must have at least one vendor assigned');
    }

    const rfqNumber = await this.generateRFQNumber();

    const { items, vendorIds, ...rfqData } = dto;

    const rfq = await this.prisma.rFQ.create({
      data: {
        ...rfqData,
        rfqNumber,
        createdBy: userId,
        status: RFQStatus.DRAFT,
        items: {
          create: items,
        },
        vendors: {
          create: vendorIds.map((vendorId: string) => ({ vendorId })),
        },
      },
      include: {
        items: true,
        vendors: true,
      },
    });

    return rfq;
  }

  async update(id: string, dto: any) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id } });

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException('Can only update DRAFT RFQs');
    }

    const { items, vendorIds, ...rfqData } = dto;

    return this.prisma.rFQ.update({
      where: { id },
      data: {
        ...rfqData,
        items: items ? { deleteMany: {}, create: items } : undefined,
        vendors: vendorIds ? { deleteMany: {}, create: vendorIds.map((v: string) => ({ vendorId: v })) } : undefined,
      },
      include: {
        items: true,
        vendors: true,
      },
    });
  }

  async publish(id: string) {
    const rfq = await this.prisma.rFQ.findUnique({
      where: { id },
      include: { items: true, vendors: true },
    });

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException('Can only publish DRAFT RFQs');
    }

    if (rfq.items.length === 0) {
      throw new BadRequestException('Cannot publish RFQ without items');
    }

    if (rfq.vendors.length === 0) {
      throw new BadRequestException('Cannot publish RFQ without vendors');
    }

    if (new Date(rfq.deadline) < new Date()) {
      throw new BadRequestException('Cannot publish RFQ with expired deadline');
    }

    return this.prisma.rFQ.update({
      where: { id },
      data: { status: RFQStatus.PUBLISHED },
    });
  }

  async remove(id: string) {
    return this.prisma.rFQ.delete({
      where: { id },
    });
  }
}

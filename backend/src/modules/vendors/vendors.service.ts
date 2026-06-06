import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  // GST Validation: 22AAAAA0000A1Z5
  private validateGST(gst: string): boolean {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    return gstRegex.test(gst) && gst.length === 15;
  }

  // Vendor Rating Formula
  private calculateRating(delivery: number, quality: number, response: number): number {
    return (delivery * 0.4) + (quality * 0.4) + (response * 0.2);
  }

  async findAll() {
    return this.prisma.vendor.findMany();
  }

  async findOne(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        rfqVendors: true,
        quotations: true,
      },
    });
  }

  async create(dto: any) {
    if (!this.validateGST(dto.gstNumber)) {
      throw new BadRequestException('Invalid GST number format');
    }

    return this.prisma.vendor.create({
      data: {
        ...dto,
        ratingScore: this.calculateRating(
          dto.deliveryScore || 0,
          dto.qualityScore || 0,
          dto.responseScore || 0,
        ),
      },
    });
  }

  async update(id: string, dto: any) {
    if (dto.gstNumber && !this.validateGST(dto.gstNumber)) {
      throw new BadRequestException('Invalid GST number format');
    }

    const updateData: any = { ...dto };
    
    if (dto.deliveryScore !== undefined || dto.qualityScore !== undefined || dto.responseScore !== undefined) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id } });
      const delivery = dto.deliveryScore ?? vendor.deliveryScore;
      const quality = dto.qualityScore ?? vendor.qualityScore;
      const response = dto.responseScore ?? vendor.responseScore;
      updateData.ratingScore = this.calculateRating(delivery, quality, response);
    }

    return this.prisma.vendor.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}

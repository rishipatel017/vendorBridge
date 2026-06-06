import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApprovalStatus, ApprovalLevel } from '@prisma/client';

@Injectable()
export class ApprovalService {
  constructor(private prisma: PrismaService) {}

  // Determine Approval Level based on PO value
  private determineApprovalLevel(amount: number): ApprovalLevel {
    if (amount < 50000) {
      return ApprovalLevel.SINGLE;
    } else if (amount >= 50000 && amount <= 500000) {
      return ApprovalLevel.MANAGER;
    } else {
      return ApprovalLevel.MANAGER_ADMIN;
    }
  }

  // Calculate Approval Deadline
  private calculateDeadline(): Date {
    const slaDays = parseInt(process.env.APPROVAL_SLA_DAYS || '3');
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + slaDays);
    return deadline;
  }

  async findAll() {
    return this.prisma.approval.findMany({
      include: {
        quotation: {
          include: {
            vendor: true,
          },
        },
        approver: {
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

  async findPending() {
    return this.prisma.approval.findMany({
      where: { status: ApprovalStatus.PENDING },
      include: {
        quotation: {
          include: {
            vendor: true,
            rfq: true,
          },
        },
        approver: {
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
    return this.prisma.approval.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            vendor: true,
            items: true,
          },
        },
        approver: {
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

  async create(quotationId: string, approverId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new BadRequestException('Quotation not found');
    }

    const level = this.determineApprovalLevel(quotation.grandTotal);
    const deadline = this.calculateDeadline();

    return this.prisma.approval.create({
      data: {
        quotationId,
        approverId,
        level,
        deadline,
        status: ApprovalStatus.PENDING,
      },
    });
  }

  async approve(id: string, approverId: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: { quotation: true },
    });

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval is not pending');
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('You are not authorized to approve this request');
    }

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
  }

  async reject(id: string, remarks: string, approverId: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval is not pending');
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('You are not authorized to reject this request');
    }

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        remarks,
      },
    });
  }
}

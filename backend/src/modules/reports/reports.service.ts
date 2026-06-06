import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Dashboard Analytics ─────────────────────────────────────────────────
  async getDashboard(user: any) {
    let vendorId = null;
    if (user.role === 'VENDOR') {
      const vendor = await this.prisma.vendor.findFirst({ where: { email: user.email } });
      if (vendor) vendorId = vendor.id;
    }

    const isVendor = user.role === 'VENDOR';
    const isManager = user.role === 'MANAGER';
    const isProcurement = user.role === 'PROCUREMENT_OFFICER';

    const poWhere = isVendor ? { vendorId } : {};
    const rfqWhere = isProcurement ? { createdBy: user.id } : {};
    const approvalWhere = isManager ? { approverId: user.id, status: 'PENDING' } : { status: 'PENDING' };

    const [
      totalVendors,
      activeRFQs,
      pendingApprovals,
      totalPOs,
      approvedPOs,
      recentLogs,
    ] = await Promise.all([
      this.prisma.vendor.count({ where: { status: 'ACTIVE' } }),
      this.prisma.rFQ.count({ where: { status: { in: ['PUBLISHED', 'QUOTATION_RECEIVED', 'UNDER_REVIEW'] }, ...rfqWhere } }),
      this.prisma.approval.count({ where: approvalWhere }),
      this.prisma.purchaseOrder.findMany({
        where: poWhere,
        include: { vendor: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.purchaseOrder.aggregate({
        where: poWhere,
        _sum: { grandTotal: true },
      }),
      this.prisma.activityLog.findMany({
        where: isVendor ? { userId: user.id } : {},
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    // Monthly spending — last 12 months from POs
    const now = new Date();
    const monthlyData: { month: string; amount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const agg = await this.prisma.purchaseOrder.aggregate({
        _sum: { grandTotal: true },
        where: { createdAt: { gte: start, lte: end }, ...poWhere },
      });
      monthlyData.push({
        month: start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        amount: agg._sum.grandTotal || 0,
      });
    }

    // Vendor performance
    const vendorPerf = await this.prisma.vendor.findMany({
      select: {
        id: true,
        companyName: true,
        ratingScore: true,
        completedOrders: true,
        totalOrders: true,
      },
      orderBy: { ratingScore: 'desc' },
      take: 5,
    });

    return {
      kpis: {
        totalVendors,
        activeRFQs,
        pendingApprovals,
        totalProcurement: approvedPOs._sum.grandTotal || 0,
      },
      monthlySpending: monthlyData,
      recentPOs: totalPOs,
      vendorPerformance: vendorPerf.map(v => ({
        ...v,
        performanceRate: v.totalOrders > 0
          ? Math.round((v.completedOrders / v.totalOrders) * 100)
          : 0,
      })),
      recentActivity: recentLogs,
    };
  }

  // ─── Vendor Report ─────────────────────────────────────────────────────────
  async getVendorReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const vendors = await this.prisma.vendor.findMany({
      where,
      include: {
        quotations: { include: { approval: true } },
        purchaseOrders: true,
        invoices: true,
      },
    });

    return vendors.map(vendor => ({
      id: vendor.id,
      companyName: vendor.companyName,
      gstNumber: vendor.gstNumber,
      category: vendor.category,
      status: vendor.status,
      ratingScore: vendor.ratingScore,
      totalQuotations: vendor.quotations.length,
      acceptedQuotations: vendor.quotations.filter(q => q.status === 'ACCEPTED').length,
      totalPOs: vendor.purchaseOrders.length,
      totalInvoices: vendor.invoices.length,
      totalSpend: vendor.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      performanceRate: vendor.totalOrders > 0
        ? Math.round((vendor.completedOrders / vendor.totalOrders) * 100)
        : 0,
    }));
  }

  // ─── Purchase Report ────────────────────────────────────────────────────────
  async getPurchaseReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const pos = await this.prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true } },
        quotation: { select: { quotationNumber: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: pos,
      summary: {
        total: pos.length,
        totalAmount: pos.reduce((s, p) => s + p.grandTotal, 0),
        byStatus: pos.reduce((acc: any, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }

  // ─── Invoice Report ─────────────────────────────────────────────────────────
  async getInvoiceReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true } },
        po: { select: { poNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: invoices,
      summary: {
        total: invoices.length,
        totalAmount: invoices.reduce((s, i) => s + i.totalAmount, 0),
        paidAmount: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0),
        pendingAmount: invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s, i) => s + i.totalAmount, 0),
        byStatus: invoices.reduce((acc: any, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {}),
      },
    };
  }

  // ─── Spend Analysis ─────────────────────────────────────────────────────────
  async getSpendAnalysis(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { vendor: true },
    });

    const byVendor = invoices.reduce((acc: any, inv) => {
      const key = inv.vendorId;
      if (!acc[key]) {
        acc[key] = { vendorName: inv.vendor.companyName, totalAmount: 0, count: 0 };
      }
      acc[key].totalAmount += inv.totalAmount;
      acc[key].count += 1;
      return acc;
    }, {});

    const byMonth = invoices.reduce((acc: any, inv) => {
      const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = 0;
      acc[key] += inv.totalAmount;
      return acc;
    }, {});

    return {
      totalSpend: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      byVendor: Object.values(byVendor),
      byMonth,
    };
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.reportsService.getDashboard(user);
  }

  @Get('vendor')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  getVendorReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getVendorReport(startDate, endDate);
  }

  @Get('purchase')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  getPurchaseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPurchaseReport(startDate, endDate);
  }

  @Get('invoice')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  getInvoiceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getInvoiceReport(startDate, endDate);
  }

  @Get('spend-analysis')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  getSpendAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSpendAnalysis(startDate, endDate);
  }
}

import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('invoice')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post('po/:poId')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  createFromPO(@Param('poId') poId: string) {
    return this.invoiceService.createFromPO(poId);
  }

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  send(@Param('id') id: string) {
    return this.invoiceService.send(id);
  }

  @Post(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  markPaid(@Param('id') id: string) {
    return this.invoiceService.markPaid(id);
  }
}

import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { QuotationService } from './quotation.service';

@Controller('quotation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get()
  findAll() {
    return this.quotationService.findAll();
  }

  @Get('rfq/:rfqId')
  findByRFQ(@Param('rfqId') rfqId: string) {
    return this.quotationService.findByRFQ(rfqId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Post()
  @Roles(UserRole.VENDOR)
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.quotationService.create(dto, user.id);
  }

  @Put(':id')
  @Roles(UserRole.VENDOR)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.quotationService.update(id, dto);
  }

  @Post(':id/submit')
  @Roles(UserRole.VENDOR)
  submit(@Param('id') id: string) {
    return this.quotationService.submit(id);
  }
}

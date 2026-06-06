import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('approval')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  findAll() {
    return this.approvalService.findAll();
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findPending() {
    return this.approvalService.findPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approvalService.findOne(id);
  }

  @Post('quotation/:quotationId')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  create(
    @Param('quotationId') quotationId: string,
    @CurrentUser() user: any,
  ) {
    return this.approvalService.create(quotationId, user.id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.approvalService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  reject(
    @Param('id') id: string,
    @Body() dto: { remarks: string },
    @CurrentUser() user: any,
  ) {
    return this.approvalService.reject(id, dto.remarks, user.id);
  }
}

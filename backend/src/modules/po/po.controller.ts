import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { POService } from './po.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('po')
@UseGuards(JwtAuthGuard, RolesGuard)
export class POController {
  constructor(private readonly poService: POService) {}

  @Get()
  findAll() {
    return this.poService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  @Post('quotation/:quotationId')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  createFromQuotation(@Param('quotationId') quotationId: string) {
    return this.poService.createFromQuotation(quotationId);
  }

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  send(@Param('id') id: string) {
    return this.poService.send(id);
  }

  @Post(':id/accept')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  accept(@Param('id') id: string) {
    return this.poService.accept(id);
  }

  @Post(':id/deliver')
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  deliver(@Param('id') id: string) {
    return this.poService.deliver(id);
  }

  @Post(':id/close')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  close(@Param('id') id: string) {
    return this.poService.close(id);
  }
}

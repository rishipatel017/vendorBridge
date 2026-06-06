import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { RFQService } from './rfq.service';

@Controller('rfq')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Get()
  findAll() {
    return this.rfqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfqService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.rfqService.create(dto, user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.rfqService.update(id, dto);
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  publish(@Param('id') id: string) {
    return this.rfqService.publish(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
  remove(@Param('id') id: string) {
    return this.rfqService.remove(id);
  }
}

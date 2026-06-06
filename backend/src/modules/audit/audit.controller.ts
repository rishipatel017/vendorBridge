import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '50') {
    return this.auditService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('entity/:entity/:entityId')
  @Roles(UserRole.ADMIN)
  findByEntity(@Param('entity') entity: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}

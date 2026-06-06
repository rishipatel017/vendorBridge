import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { RFQModule } from './modules/rfq/rfq.module';
import { QuotationModule } from './modules/quotation/quotation.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { POModule } from './modules/po/po.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    RFQModule,
    QuotationModule,
    ApprovalModule,
    POModule,
    InvoiceModule,
    ReportsModule,
    AuditModule,
  ],
})
export class AppModule {}

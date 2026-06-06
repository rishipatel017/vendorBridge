import { Module } from '@nestjs/common';
import { POController } from './po.controller';
import { POService } from './po.service';

@Module({
  controllers: [POController],
  providers: [POService],
  exports: [POService],
})
export class POModule {}

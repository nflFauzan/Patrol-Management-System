import { Module } from '@nestjs/common';
import { CleaningService } from './cleaning.service';
import { CleaningController } from './cleaning.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  providers: [CleaningService],
  controllers: [CleaningController],
  exports: [CleaningService],
})
export class CleaningModule {}

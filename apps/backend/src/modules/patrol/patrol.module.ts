import { Module } from '@nestjs/common';
import { PatrolService } from './patrol.service';
import { PatrolController } from './patrol.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  providers: [PatrolService],
  controllers: [PatrolController],
  exports: [PatrolService],
})
export class PatrolModule {}

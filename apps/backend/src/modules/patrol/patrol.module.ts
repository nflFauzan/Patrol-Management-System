import { Module } from '@nestjs/common';
import { PatrolService } from './patrol.service';
import { PatrolController } from './patrol.controller';

@Module({
  providers: [PatrolService],
  controllers: [PatrolController],
  exports: [PatrolService],
})
export class PatrolModule {}

import { Module } from '@nestjs/common';
import { LegacyController } from './legacy.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { SosModule } from '../sos/sos.module';
import { DriverModule } from '../driver/driver.module';
import { PatrolModule } from '../patrol/patrol.module';

@Module({
  imports: [
    AttendanceModule,
    SosModule,
    DriverModule,
    PatrolModule,
  ],
  controllers: [LegacyController],
})
export class LegacyModule {}


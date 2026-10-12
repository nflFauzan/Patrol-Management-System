import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { AuthModule } from './modules/auth/auth.module';
import { SitesModule } from './modules/sites/sites.module';
import { CheckpointsModule } from './modules/checkpoints/checkpoints.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PatrolModule } from './modules/patrol/patrol.module';
import { CleaningModule } from './modules/cleaning/cleaning.module';
import { SosModule } from './modules/sos/sos.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    GatewayModule,
    AuthModule,
    SitesModule,
    CheckpointsModule,
    AttendanceModule,
    PatrolModule,
    CleaningModule,
    SosModule,
    ReportsModule,
  ],
})
export class AppModule {}

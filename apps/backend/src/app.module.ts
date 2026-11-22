import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { AuthModule } from './modules/auth/auth.module';
import { SitesModule } from './modules/sites/sites.module';
import { CheckpointsModule } from './modules/checkpoints/checkpoints.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PatrolModule } from './modules/patrol/patrol.module';
import { CleaningModule } from './modules/cleaning/cleaning.module';
import { DriverModule } from './modules/driver/driver.module';
import { SosModule } from './modules/sos/sos.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';
import { UsersModule } from './modules/users/users.module';
import { StaffModule } from './modules/staff/staff.module';
import { LegacyModule } from './modules/legacy/legacy.module';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'Patrol Management System Backend API',
      company: 'PT Berdikari Maju Selaras',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    GatewayModule,
    AuthModule,
    UsersModule,
    SitesModule,
    CheckpointsModule,
    AttendanceModule,
    PatrolModule,
    CleaningModule,
    DriverModule,
    SosModule,
    ReportsModule,
    BroadcastModule,
    StaffModule,
    LegacyModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }

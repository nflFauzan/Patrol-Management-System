import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, ClockInRequestDto, ClockOutRequestDto, LeaveRequestDto, Attendance } from '@patrol/types';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('today')
  async getToday(@CurrentUser() user: User): Promise<Attendance | null> {
    return this.attendanceService.getTodayStatus(user.id);
  }

  @Post('clock-in')
  async clockIn(
    @CurrentUser() user: User,
    @Body() dto: ClockInRequestDto,
  ): Promise<Attendance> {
    return this.attendanceService.clockIn(user.id, dto);
  }

  @Post('clock-out')
  async clockOut(
    @CurrentUser() user: User,
    @Body() dto: ClockOutRequestDto,
  ): Promise<Attendance> {
    return this.attendanceService.clockOut(user.id, dto);
  }

  @Post('leave')
  async requestLeave(
    @CurrentUser() user: User,
    @Body() dto: LeaveRequestDto,
  ): Promise<Attendance> {
    return this.attendanceService.leaveRequest(user.id, dto);
  }
}

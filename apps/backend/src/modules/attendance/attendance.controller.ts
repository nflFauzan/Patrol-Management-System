import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, ClockInRequestDto, ClockOutRequestDto, LeaveRequestDto, Attendance, AttendanceMatrixResponse } from '@patrol/types';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('today')
  async getToday(@CurrentUser() user: User): Promise<Attendance | null> {
    return this.attendanceService.getTodayStatus(user.id);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ): Promise<Attendance[]> {
    return this.attendanceService.getUserHistory(user.id, limit ? parseInt(limit, 10) : 30);
  }

  @Get('monitoring-matrix')
  async getMonitoringMatrix(
    @Query('month') month?: string,
    @Query('siteId') siteId?: string,
    @Query('division') division?: string,
  ): Promise<AttendanceMatrixResponse> {
    return this.attendanceService.getAttendanceMatrix({ month, siteId, division });
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

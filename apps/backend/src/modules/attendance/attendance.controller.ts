import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { 
  User, 
  ClockInRequestDto, 
  ClockOutRequestDto, 
  LeaveRequestDto, 
  Attendance, 
  AttendanceMatrixResponse,
  AttendanceRecordsResponse,
  AttendanceDetailResponse,
  AttendancePersonilOption
} from '@patrol/types';

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

  @Get('records')
  async getRecords(
    @Query('siteName') siteName?: string,
    @Query('division') division?: string,
    @Query('userName') userName?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AttendanceRecordsResponse> {
    return this.attendanceService.getAttendanceRecords({
      siteName,
      division,
      userName,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 5,
    });
  }

  @Get('personil-options')
  async getPersonilOptions(
    @Query('siteName') siteName?: string,
    @Query('division') division?: string,
  ): Promise<AttendancePersonilOption[]> {
    return this.attendanceService.getPersonilOptions(siteName, division);
  }

  @Get(':id/detail')
  async getDetail(@Param('id') id: string): Promise<AttendanceDetailResponse> {
    return this.attendanceService.getAttendanceDetail(id);
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

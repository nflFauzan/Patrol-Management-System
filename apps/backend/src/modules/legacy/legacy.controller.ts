import { Controller, Post, Get, Body, Query, Res, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AttendanceStatus } from '@patrol/types';
import { DatabaseService } from '../../database/database.service';
import { AttendanceService } from '../attendance/attendance.service';
import { SosService } from '../sos/sos.service';
import { DriverService } from '../driver/driver.service';
import { PatrolService } from '../patrol/patrol.service';

@Controller()
export class LegacyController {
  private readonly logger = new Logger(LegacyController.name);

  constructor(
    private db: DatabaseService,
    private attendanceService: AttendanceService,
    private sosService: SosService,
    private driverService: DriverService,
    private patrolService: PatrolService,
  ) {}

  /**
   * Helper: Resolve user by kode_anggota, username, or NIK
   */
  private async resolveUser(identifier?: string) {
    if (!identifier) {
      // Return default chief for demonstration if unspecified
      return this.db.queryOne<any>(`SELECT id, username, full_name, site_id, division, role FROM users WHERE role = 'CHIEF' OR username = 'hendra.chief' LIMIT 1`);
    }

    return this.db.queryOne<any>(
      `SELECT id, username, full_name, site_id, division, role 
       FROM users 
       WHERE id::text = $1 OR username = $1 OR nik = $1 OR phone = $1 
       LIMIT 1`,
      [identifier.trim().toLowerCase()],
    ) || this.db.queryOne<any>(`SELECT id, username, full_name, site_id, division, role FROM users LIMIT 1`);
  }

  /**
   * 1. POST /insert-presensi.php (Absen Masuk atau Izin Alpha)
   */
  @Post(['insert-presensi.php', 'api/v1/legacy/insert-presensi.php'])
  @HttpCode(HttpStatus.OK)
  async insertPresensi(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert-presensi called with body: ${JSON.stringify({ ...body, image: body.image ? '[BASE64_IMAGE]' : null })}`);
      
      const user = await this.resolveUser(body.kode_anggota || body.username);
      const siteId = user?.site_id || '11111111-1111-1111-1111-111111111111';

      if (body.status_absen === '2' || body.alasan === 'Sakit' || body.alasan === 'Keperluan Keluarga' || body.alasan === 'Keperluan Pribadi') {
        // Izin / Leave
        const res = await this.attendanceService.leaveRequest(user.id, {
          siteId,
          status: body.alasan === 'Sakit' ? AttendanceStatus.SICK : AttendanceStatus.PERMISSION,
          date: new Date().toISOString().split('T')[0],
          leaveReason: body.alasan || 'Izin Tidak Masuk',
          attachmentBase64: body.image || undefined,
        });
        return reply.send({ success: true, message: 'Izin berhasil diajukan', data: res });
      }

      // Absen Masuk
      const lat = parseFloat(body.latitude_in || body.lat || '-6.562713');
      const lng = parseFloat(body.longitude_in || body.long || '106.856165');
      const res = await this.attendanceService.clockIn(user.id, {
        siteId,
        latitude: lat,
        longitude: lng,
        photoBase64: body.image || '',
        notes: body.alasan === '2' ? 'Lembur' : body.alasan === '3' ? 'Penugasan lain' : 'Piket Rutin',
      });

      return reply.send({ success: true, message: 'Absensi masuk berhasil disimpan!', data: res });
    } catch (err: any) {
      this.logger.error(`Error in insert-presensi: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 2. POST /update-presensi.php (Absen Pulang)
   */
  @Post(['update-presensi.php', 'api/v1/legacy/update-presensi.php'])
  @HttpCode(HttpStatus.OK)
  async updatePresensi(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy update-presensi called`);
      const user = await this.resolveUser(body.kode_anggota || body.username);
      const lat = parseFloat(body.latitude_out || body.lat || '-6.562700');
      const lng = parseFloat(body.longitude_out || body.long || '106.856164');

      const res = await this.attendanceService.clockOut(user.id, {
        latitude: lat,
        longitude: lng,
        photoBase64: body.image || '',
        notes: body.catatan || 'Selesai shift/jaga',
      });

      return reply.send({ success: true, message: 'Absensi pulang berhasil dicatat!', data: res });
    } catch (err: any) {
      this.logger.error(`Error in update-presensi: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 3. POST /insert_chief.php (Evaluasi Harian Chief Security)
   */
  @Post(['insert_chief.php', 'api/v1/legacy/insert_chief.php'])
  @HttpCode(HttpStatus.OK)
  async insertChief(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert_chief called: ${JSON.stringify(body)}`);
      const chief = await this.resolveUser('hendra.chief');
      const danru = await this.resolveUser(body.kode_anggota);
      const siteId = chief?.site_id || '11111111-1111-1111-1111-111111111111';

      const discScore = body.disiplin === 'Baik' ? 3 : body.disiplin === 'Cukup' ? 2 : 1;
      const coordScore = body.koordinasi === 'Baik' ? 3 : body.koordinasi === 'Cukup' ? 2 : 1;
      const attScore = body.kehadiran_regu === 'Lengkap' ? 3 : 1;

      const incidentNotes = body.insiden === 'Ada' 
        ? `[INSIDEN]: ${body.detail_insiden || '-'} | Catatan: ${body.catatan || '-'}`
        : `[AMAN]: ${body.catatan || '-'}`;

      await this.db.query(
        `INSERT INTO chief_evaluations (site_id, chief_id, komandan_id, discipline_score, coordination_score, attendance_score, incident_notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [siteId, chief.id, danru.id, discScore, coordScore, attScore, incidentNotes]
      );

      return reply.send({ success: true, message: 'Laporan Chief berhasil disimpan!' });
    } catch (err: any) {
      this.logger.error(`Error in insert_chief: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 4. POST /insert_komandan.php (Laporan Shift Danru)
   */
  @Post(['insert_komandan.php', 'api/v1/legacy/insert_komandan.php'])
  @HttpCode(HttpStatus.OK)
  async insertKomandan(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert_komandan called: ${JSON.stringify(body)}`);
      const danru = await this.resolveUser('dandan.danru');
      const siteId = danru?.site_id || '11111111-1111-1111-1111-111111111111';

      await this.db.query(
        `INSERT INTO shift_handovers (site_id, danru_id, shift_name, handover_time, personnel_on_duty_count, general_notes)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5)`,
        [
          siteId,
          danru.id,
          body.shift || 'Pagi',
          parseInt(body.jumlah_hadir || '10', 10),
          `Kesimpulan: ${body.kesimpulan === 'A' ? 'Aman' : 'Ada Catatan'} | Catatan: ${body.catatan || '-'}`,
        ]
      );

      return reply.send({ success: true, message: 'Laporan Komandan berhasil disimpan!' });
    } catch (err: any) {
      this.logger.error(`Error in insert_komandan: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 5. POST /insert_driver.php (Perjalanan Driver Logistik)
   */
  @Post(['insert_driver.php', 'api/v1/legacy/insert_driver.php'])
  @HttpCode(HttpStatus.OK)
  async insertDriver(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert_driver called`);
      const driver = await this.resolveUser('joko.driver');
      const siteId = driver?.site_id || '11111111-1111-1111-1111-111111111111';

      await this.db.query(
        `INSERT INTO driver_trip_logs (site_id, driver_id, vehicle_plate_number, vehicle_type, origin_location, destination_location, started_at, trip_status, trip_notes)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, 'IN_PROGRESS', $7)`,
        [
          siteId,
          driver.id,
          body.nopol || 'B 1234 PS',
          body.tipe || 'Operasional',
          'Kantor Pusat',
          body.tujuan || 'Gudang Logistik',
          body.keperluan || 'Tugas dinas',
        ]
      );

      return reply.send({ success: true, message: 'Perjalanan driver berhasil dicatat!' });
    } catch (err: any) {
      this.logger.error(`Error in insert_driver: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 6. POST /insert_staf.php (Kegiatan Staff & Cleaning Service)
   */
  @Post(['insert_staf.php', 'api/v1/legacy/insert_staf.php'])
  @HttpCode(HttpStatus.OK)
  async insertStaf(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert_staf called`);
      const staff = await this.resolveUser('siti.cleaning');
      const siteId = staff?.site_id || '11111111-1111-1111-1111-111111111111';

      await this.db.query(
        `INSERT INTO staff_activity_logs (site_id, user_id, activity_type, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [
          siteId,
          staff.id,
          body.jenis_kegiatan || 'Pembersihan',
          `${body.detail_lainnya ? body.detail_lainnya + ' - ' : ''}${body.deskripsi || '-'}`,
          body.status || 'selesai',
        ]
      );

      return reply.send({ success: true, message: 'Kegiatan staff berhasil disimpan!' });
    } catch (err: any) {
      this.logger.error(`Error in insert_staf: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 7. POST /insert-panic.php (Panic Button SOS)
   */
  @Post(['insert-panic.php', 'api/v1/legacy/insert-panic.php'])
  @HttpCode(HttpStatus.OK)
  async insertPanic(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy insert-panic called`);
      const user = await this.resolveUser(body.kode_anggota || 'hendra.chief');
      const lat = parseFloat(body.latitude || '-6.562713');
      const lng = parseFloat(body.longitude || '106.856165');

      const siteId = user?.site_id || '11111111-1111-1111-1111-111111111111';

      const res = await this.sosService.triggerSos(user.id, {
        siteId,
        latitude: lat,
        longitude: lng,
      });

      return reply.send({ success: true, message: 'Alarm darurat SOS berhasil dikirimkan!', data: res });
    } catch (err: any) {
      this.logger.error(`Error in insert-panic: ${err.message}`);
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 8. POST /cek.php (Scan QR Checkpoint Patroli)
   */
  @Post(['cek.php', 'api/v1/legacy/cek.php'])
  @HttpCode(HttpStatus.OK)
  async checkQr(@Body() body: any, @Res() reply: FastifyReply) {
    try {
      this.logger.log(`Legacy cek.php called: ${body.nama}`);
      const user = await this.resolveUser();
      return reply.send({
        success: true,
        message: 'Checkpoint valid terdeteksi!',
        qrToken: body.nama,
        scannedBy: user.full_name,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return reply.status(200).send({ success: false, message: err.message });
    }
  }

  /**
   * 9. GET /serverside-presensi.php (DataTables Riwayat Absensi)
   */
  @Get(['serverside-presensi.php', 'api/v1/legacy/serverside-presensi.php'])
  async serverSidePresensi(@Query() query: any, @Res() reply: FastifyReply) {
    const user = await this.resolveUser();
    const rows = await this.db.query<any>(
      `SELECT 
         a.id,
         to_char(a.clock_in_at, 'Day, DD Mon YYYY | HH24:MI:SS') AS clock_in_str,
         to_char(a.clock_out_at, 'Day, DD Mon YYYY | HH24:MI:SS') AS clock_out_str,
         a.status_type,
         a.reason,
         a.notes
       FROM attendances a
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [user.id]
    );

    const data = rows.map(r => [
      r.status_type === 3 ? 'Izin Tidak Masuk' : (r.clock_in_str || '-'),
      r.status_type === 3 ? `${r.reason || 'Izin'} | ${r.notes || ''}` : (r.clock_out_str || '-'),
      `<button class="btn btn-sm btn-info" onclick="bukaDetail('${r.id}')">Detail</button>`
    ]);

    return reply.send({
      draw: parseInt(query.draw || '1', 10),
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data,
    });
  }

  /**
   * 10. GET /serverside-chief.php (DataTables Riwayat Kegiatan Chief)
   */
  @Get(['serverside-chief.php', 'api/v1/legacy/serverside-chief.php'])
  async serverSideChief(@Query() query: any, @Res() reply: FastifyReply) {
    const rows = await this.db.query<any>(
      `SELECT 
         c.id,
         u.full_name AS komandan_name,
         c.discipline_score,
         c.coordination_score,
         c.attendance_score,
         c.incident_notes,
         to_char(c.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_str
       FROM chief_evaluations c
       JOIN users u ON c.komandan_id = u.id
       ORDER BY c.created_at DESC
       LIMIT 50`
    );

    const data = rows.map(r => [
      r.komandan_name,
      r.discipline_score === 3 ? 'Baik' : r.discipline_score === 2 ? 'Cukup' : 'Kurang',
      r.coordination_score === 3 ? 'Baik' : r.coordination_score === 2 ? 'Cukup' : 'Kurang',
      r.attendance_score === 3 ? 'Lengkap' : 'Tidak Lengkap',
      r.incident_notes.includes('[INSIDEN]') ? 'Ada' : 'Tidak Ada',
      `<button class="btn btn-sm btn-primary" onclick="bukaDetailChief('${r.id}')">Detail</button>`
    ]);

    return reply.send({
      draw: parseInt(query.draw || '1', 10),
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data,
    });
  }
}


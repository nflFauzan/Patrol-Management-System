// ============================================================================
// ENTERPRISE PATROL & FACILITY MANAGEMENT SYSTEM - SHARED TYPES (SSOT)
// ============================================================================

// ----------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ----------------------------------------------------------------------------

export enum UserRole {
  ADMIN_SUPER = 'ADMIN_SUPER',
  ADMIN_AREA = 'ADMIN_AREA',
  OPS_MANAGER = 'OPS_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  SECURITY_OFFICER = 'SECURITY_OFFICER',
  CLEANER = 'CLEANER',
  DRIVER = 'DRIVER',
  STAFF = 'STAFF',
}

export enum SecurityRank {
  ANGGOTA = 'ANGGOTA',
  KOMANDAN = 'KOMANDAN',
  CHIEF = 'CHIEF',
}

export enum Division {
  SECURITY = 'SECURITY',
  CLEANING = 'CLEANING',
  DRIVER = 'DRIVER',
  STAFF = 'STAFF',
}

export enum AttendanceStatus {
  IN = 'IN',
  OUT = 'OUT',
  SICK = 'SICK',
  PERMISSION = 'PERMISSION',
  ALPHA = 'ALPHA',
}

export enum AttendanceMatrixStatusCode {
  MASUK = 'M',
  PULANG = 'P',
  PULANG_CROSS_MIDNIGHT = 'P+',
  PULANG_NEXT_DAY = 'P+',
  LUPA_ABSEN = 'X',
  IZIN = 'I',
  OFF = '-',
}

export enum PatrolStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  ABORTED = 'ABORTED',
}

export enum CheckpointCondition {
  NORMAL = 'NORMAL',
  ABNORMAL = 'ABNORMAL',
  MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED',
}

export enum PatrolResultCondition {
  AMAN_TERKENDALI = 'Situasi Aman Terkendali',
  PERLU_TINDAK_LANJUT = 'Perlu Tindak Lanjut',
}

export enum SosStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
}

// ----------------------------------------------------------------------------
// CORE ENTITIES
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  division: Division;
  securityRank?: SecurityRank | null;
  siteId?: string | null;
  multiSiteIds?: string[];
  workingHoursPerDay?: number;
  // Payroll & financial attributes
  gajiPokok?: number;
  tunjangan?: number;
  lemburPerJam?: number;
  potonganBpjs?: number;
  potonganAlpa?: number;
  potonganLupaAbsen?: number;
  isActive: boolean;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  // Shift Schedules per Site (Patroli.site parity)
  shiftPagiMasuk?: string; // e.g. "07:00"
  shiftPagiPulang?: string; // e.g. "15:00"
  shiftSiangMasuk?: string; // e.g. "15:00"
  shiftSiangPulang?: string; // e.g. "23:00"
  shiftMalamMasuk?: string; // e.g. "23:00"
  shiftMalamPulang?: string; // e.g. "07:00"
  shiftStafMasuk?: string; // e.g. "08:00"
  shiftStafPulang?: string; // e.g. "17:00"
  shiftChiefMasuk?: string; // e.g. "08:00"
  shiftChiefPulang?: string; // e.g. "17:00"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Checkpoint {
  id: string;
  siteId: string;
  division: Division;
  code: string;
  name: string;
  locationDescription?: string | null;
  taskDescription?: string | null;
  assetType?: string | null;
  latitude: number;
  longitude: number;
  allowedDistanceMeters: number;
  qrPayload: string;
  sequenceOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSchedule {
  id: string;
  siteId: string;
  division: Division;
  name: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  gracePeriodMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  siteId: string;
  shiftId?: string | null;
  division: Division;
  date: string; // YYYY-MM-DD
  clockInTime?: string | null;
  clockInLatitude?: number | null;
  clockInLongitude?: number | null;
  clockInPhotoUrl?: string | null;
  clockInWithinGeofence?: boolean | null;
  clockInDistanceMeters?: number | null;
  clockOutTime?: string | null;
  clockOutLatitude?: number | null;
  clockOutLongitude?: number | null;
  clockOutPhotoUrl?: string | null;
  clockOutWithinGeofence?: boolean | null;
  clockOutDistanceMeters?: number | null;
  status: AttendanceStatus;
  leaveReason?: string | null;
  leaveAttachmentUrl?: string | null;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  effectiveWorkingMinutes: number;
  isOvertime: boolean;
  overtimeMinutes: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatrolSchedule {
  id: string;
  siteId: string;
  division: Division;
  shiftId: string;
  title: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  frequencyPerShift: number;
  daysOfWeek: number[]; // 0=Sunday, 6=Saturday
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatrolLog {
  id: string;
  scheduleId?: string | null;
  siteId: string;
  userId: string;
  division: Division;
  startedAt: string;
  completedAt?: string | null;
  totalCheckpoints: number;
  scannedCheckpoints: number;
  status: PatrolStatus;
  summaryNotes?: string | null;
  details?: PatrolLogDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface PatrolLogDetail {
  id: string;
  patrolLogId: string;
  checkpointId: string;
  scannedAt: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isWithinGeofence: boolean;
  photoUrl?: string | null;
  condition: CheckpointCondition;
  resultStatus?: PatrolResultCondition | string;
  notes?: string | null;
  qrPayloadScanned: string;
  createdAt: string;
}

export interface PatrolRecordItem {
  id: string;
  siteName: string;
  officerName: string;
  position?: string;
  assetName: string;
  assetType?: string;
  assetLocation?: string;
  taskDescription?: string;
  statusResult: string;
  notes?: string | null;
  scannedAt: string;
  dateFormatted: string;
  timeFormatted: string;
  dateTimeFull: string;
  latitude: number;
  longitude: number;
  photoUrl?: string | null;
  tindakLanjutStatus?: string | null;
}

export interface PatrolRecordsResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: PatrolRecordItem[];
}

export interface PatrolDetailResponse {
  id: string;
  officerName: string;
  position: string;
  siteName: string;
  avatarUrl?: string | null;
  activityStatus: string;
  assetName: string;
  assetType: string;
  assetLocation: string;
  dateFormatted: string;
  timeFormatted: string;
  patrolCode: string;
  taskDescription: string;
  patrolResult: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  photoUrl?: string | null;
  tindakLanjutStatus?: string | null;
}

export interface CleaningRecordItem {
  id: string;
  kodePatroli: string;
  siteName: string;
  personilName: string;
  status: string;
  taskDescription: string;
  timeFormatted: string;
  dateTimeFull?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string | null;
  tindakLanjutStatus?: string | null;
}

export interface CleaningRecordsResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: CleaningRecordItem[];
}

export interface CleaningDetailResponse {
  id: string;
  kodePatroli: string;
  officerName: string;
  position: string;
  siteName: string;
  avatarUrl?: string | null;
  activityStatus: string;
  assetName: string;
  assetType: string;
  assetLocation: string;
  dateFormatted: string;
  timeFormatted: string;
  cleaningCode: string;
  taskDescription: string;
  cleaningResult: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  photoUrl?: string | null;
  tindakLanjutStatus?: string | null;
}

export interface IncidentReport {
  id: string;
  siteId: string;
  userId: string;
  division: Division;
  checkpointId?: string | null;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  photoUrls: string[];
  actionTaken?: string | null;
  reportedAt: string;
  resolvedAt?: string | null;
  resolvedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAlert {
  id: string;
  siteId: string;
  userId: string;
  division: Division;
  latitude: number;
  longitude: number;
  addressSnapshot?: string | null;
  photoUrl?: string | null;
  message?: string | null;
  status: SosStatus;
  acknowledgedByUserId?: string | null;
  acknowledgedAt?: string | null;
  resolvedByUserId?: string | null;
  resolvedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastMessage {
  id: string;
  siteId?: string | null;
  siteName?: string | null;
  title?: string;
  content: string;
  message?: string;
  priority?: string;
  senderId: string;
  senderName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KomandanShiftLog {
  id: string;
  siteId: string;
  userId: string;
  shiftName: string;
  personnelPresentCount: number;
  notes: string;
  createdAt: string;
}

export interface ChiefEvaluation {
  id: string;
  siteId: string;
  chiefId: string;
  komandanId: string;
  komandanName: string;
  disciplineScore: number;
  coordinationScore: number;
  attendanceScore: number;
  incidentNotes?: string | null;
  createdAt: string;
}

export interface StaffActivityLog {
  id: string;
  siteId: string;
  userId: string;
  activityType: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface DriverTripLog {
  id: string;
  siteId: string;
  userId: string;
  vehicleType: string;
  licensePlate: string;
  odometerStart?: number | null;
  odometerEnd?: number | null;
  destination: string;
  cargoNotes?: string | null;
  status: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// MONITORING & MATRIX DTOs
// ----------------------------------------------------------------------------

export interface AttendanceMatrixDay {
  day: number;
  status: AttendanceMatrixStatusCode;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  shiftColor?: string | null;
  logs?: Array<{
    type: 'M' | 'P' | 'P+' | 'X';
    time?: string | null;
    shiftColor?: string | null;
  }>;
}

export interface AttendanceMatrixRow {
  userId: string;
  fullName: string;
  siteName: string;
  division: Division;
  role: UserRole;
  days: Record<number, AttendanceMatrixDay>;
  totalHadir: number;
  totalLupaAbsen: number;
  totalIzin: number;
}

export interface AttendanceMatrixResponse {
  month: string; // YYYY-MM
  siteId?: string;
  division?: Division;
  totalDays: number;
  rows: AttendanceMatrixRow[];
}

export interface AttendanceFilterDto {
  siteName?: string;
  division?: string;
  userName?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceRecordItem {
  id: string;
  siteName: string;
  division: string;
  personilName: string;
  userAvatar?: string | null;
  // Clock in info
  clockInDateStr: string; // e.g. "Sabtu, 17 Oct 2026"
  clockInTimeStr: string; // e.g. "00:46:13"
  isLate: boolean;
  lateText?: string | null; // e.g. "3 jam 1 menit 17 detik"
  clockInWithinGeofence: boolean;
  clockInLatitude?: number | null;
  clockInLongitude?: number | null;
  clockInPhotoUrl?: string | null;
  clockInDistanceMeters?: number | null;
  // Clock out info
  isClockedOut: boolean;
  isLupaAbsenPulang: boolean;
  clockOutDateStr?: string | null;
  clockOutTimeStr?: string | null;
  clockOutWithinGeofence?: boolean | null;
  clockOutLatitude?: number | null;
  clockOutLongitude?: number | null;
  clockOutPhotoUrl?: string | null;
  clockOutDistanceMeters?: number | null;
  // Site coordinate
  siteLatitude?: number | null;
  siteLongitude?: number | null;
}

export interface AttendanceRecordsResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: AttendanceRecordItem[];
}

export interface AttendanceDetailLocation {
  lat: number;
  lon: number;
  label: string;
  personilName?: string;
}

export interface AttendanceDetailResponse {
  id: string;
  userId: string;
  personilName: string;
  siteName: string;
  division: string;
  userAvatar?: string | null;
  clockInDateFull: string;
  clockOutDateFull: string;
  clockInPhotoUrl?: string | null;
  clockOutPhotoUrl?: string | null;
  locationsIn: AttendanceDetailLocation[];
  locationsOut: AttendanceDetailLocation[];
  distanceInMeters?: number | null;
  distanceOutMeters?: number | null;
}

export interface AttendancePersonilOption {
  id: string;
  name: string;
  division: string;
  siteName: string;
}

export interface HourlyPatrolMatrixRow {
  checkpointId: string;
  assetName: string;
  checkpointName?: string;
  locationDescription: string;
  locationDetail?: string;
  category: Division | string;
  hours: Record<number, boolean>; // hour 0-23 => boolean
  hourlyStatus?: boolean[];
  totalScanned: number;
  totalScans?: number;
}

export interface HourlyPatrolMatrixResponse {
  date: string; // YYYY-MM-DD
  siteId: string;
  siteName: string;
  hours?: string[];
  rows: HourlyPatrolMatrixRow[];
}

export interface PayrollReportRow extends PayrollSummaryRow {
  nik?: string;
  alpaCount?: number;
  lemburHours?: number;
  totalLembur?: number;
  potonganBpjs?: number;
  potonganAlpa?: number;
  potonganIzin?: number;
  potonganLupaAbsen?: number;
  totalPotLupa?: number;
  totalPotIzin?: number;
  totalGajiLembur?: number;
  gajiKotor?: number;

  // 100% Parity aliases with patroli.site fetch_absensi.php
  nama_anggota?: string;
  posisi?: string;
  lokasi_site?: string;
  gapok?: number | string;
  lembur?: number | string;
  pot_bpjs?: number | string;
  pot_izin?: number | string;
  pot_lupa?: number | string;
  bulan?: string;
  tahun?: string;
  total_hadir?: number | string;
  total_lupa_absen?: number | string;
  total_izin?: number | string;
  total_lembur?: number | string;
  total_pot_lupa?: number;
  total_pot_izin?: number;
  total_gaji_lembur?: number;
  total_gaji?: number;
}

export interface PayrollSummaryRow {
  userId: string;
  fullName: string;
  division: Division | string;
  role?: UserRole | string;
  siteName: string;
  month?: number;
  year?: number;
  hadirCount: number;
  lupaAbsenCount: number;
  izinCount: number;
  gajiPokok: number;
  tunjangan: number;
  lemburNominal: number;
  totalPotongan: number;
  gajiDiterima: number;
  potonganBpjs?: number;
  potonganIzin?: number;
  potonganLupaAbsen?: number;
}

// ----------------------------------------------------------------------------
// BULK IMPORT & TEMPLATE DTOs
// ----------------------------------------------------------------------------

export interface CheckpointImportRow {
  namaAset: string;
  kategori: Division | string;
  lokasi: string;
  deskripsiTugas?: string;
  jenisAset?: string;
  siteCodeOrName: string;
  latitude?: number;
  longitude?: number;
}

export interface PersonilImportRow {
  nama: string;
  username: string;
  password?: string;
  posisi: UserRole | string;
  jabatan?: SecurityRank | string;
  jamKerja?: number;
  siteCodeOrName: string;
  gajiPokok?: number;
  tunjangan?: number;
  lemburPerJam?: number;
  potonganBpjs?: number;
  potonganAlpa?: number;
  potonganLupaAbsen?: number;
}

// ----------------------------------------------------------------------------
// API REQUEST & RESPONSE TYPES
// ----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

// Auth DTOs
export interface LoginRequestDto {
  username: string;
  password: string;
  hp_input?: string; // Honeypot field for bot prevention (matching patroli.site login.php)
}

export interface LoginResponseDto {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Attendance DTOs
export interface ClockInRequestDto {
  siteId: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
  notes?: string;
}

export interface ClockOutRequestDto {
  attendanceId?: string;
  siteId?: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
  notes?: string;
}

export interface LeaveRequestDto {
  siteId: string;
  status: AttendanceStatus.SICK | AttendanceStatus.PERMISSION;
  date: string;
  leaveReason: string;
  attachmentBase64?: string;
}

// Patrol DTOs
export interface StartPatrolRequestDto {
  siteId: string;
  scheduleId?: string;
}

export interface ScanCheckpointRequestDto {
  patrolLogId?: string;
  checkpointId: string;
  qrPayload: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
  condition?: CheckpointCondition;
  resultStatus?: PatrolResultCondition | string;
  notes?: string;
}

export interface FinishPatrolRequestDto {
  patrolLogId: string;
  summaryNotes?: string;
}

// SOS DTOs
export interface TriggerSosRequestDto {
  siteId: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
  message?: string;
}

export interface AcknowledgeSosRequestDto {
  alertId: string;
  notes?: string;
}

export interface ResolveSosRequestDto {
  alertId: string;
  notes?: string;
  isFalseAlarm?: boolean;
}

export interface EmergencyLogQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  siteId?: string;
  status?: string;
}

export interface EmergencyLogItem {
  id: string;
  siteId: string;
  siteName: string;
  userId: string;
  officerName: string;
  officerPhone?: string;
  division: string;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  triggeredAt: string;
  formattedTime: string;
  dayName: string;
  timeOnly: string;
  alertStatus: string;
  isWhatsappDispatched: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  resolutionNotes?: string | null;
}

export interface PaginatedEmergencyLogs {
  data: EmergencyLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Export Center DTOs
export interface ExportReportRequestDto {
  type: 'ABSENSI_PERSONIL' | 'ABSENSI_AREA' | 'PATROLI_PERSONIL' | 'PATROLI_AREA';
  startDate: string;
  endDate: string;
  siteId?: string;
  division?: Division;
  userId?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

// HRIS Export DTO
export interface HrisAttendanceFilterDto {
  startDate: string;
  endDate: string;
  siteId?: string;
  division?: Division;
  role?: UserRole;
  format?: 'json' | 'csv' | 'xlsx';
}

export interface HrisAttendanceRow {
  employeeId: string;
  username: string;
  fullName: string;
  division: Division;
  siteName: string;
  date: string;
  shiftName: string;
  clockInTime: string;
  clockInLocationStatus: 'VALID' | 'OUTSIDE_GEOFENCE';
  clockOutTime: string;
  clockOutLocationStatus: 'VALID' | 'OUTSIDE_GEOFENCE';
  lateMinutes: number;
  earlyDepartureMinutes: number;
  effectiveWorkingHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
}

// ----------------------------------------------------------------------------
// WEBSOCKET EVENTS (REALTIME DISPATCH)
// ----------------------------------------------------------------------------

export interface ServerToClientEvents {
  // SOS & Emergency
  'sos:new': (alert: EmergencyAlert & { user: User; site: Site; mapsUrl: string }) => void;
  'sos:status_changed': (alert: EmergencyAlert) => void;

  // Patrol Monitoring
  'patrol:started': (log: PatrolLog & { user: User; site: Site }) => void;
  'patrol:checkpoint_scanned': (detail: PatrolLogDetail & { checkpoint: Checkpoint; user: User }) => void;
  'patrol:completed': (log: PatrolLog) => void;

  // Attendance
  'attendance:clock_in': (attendance: Attendance & { user: User; site: Site }) => void;
  'attendance:clock_out': (attendance: Attendance & { user: User; site: Site }) => void;

  // Broadcast Message Announcement
  'broadcast:new': (message: BroadcastMessage) => void;
  'broadcast:updated': (message: BroadcastMessage) => void;
  'broadcast:deleted': (payload: { id: string }) => void;

  // Real-time GPS Tracking
  'gps:update': (payload: { userId: string; fullName: string; division: Division; siteId: string; latitude: number; longitude: number; updatedAt: string }) => void;
}

export interface ClientToServerEvents {
  'join:site_room': (siteId: string) => void;
  'leave:site_room': (siteId: string) => void;
  'gps:broadcast': (payload: { siteId: number | string; latitude: number; longitude: number }) => void;
}

// ----------------------------------------------------------------------------
// CHIEF EVALUATIONS & REPORTS (PATROLI.SITE PARITY)
// ----------------------------------------------------------------------------

export interface ChiefEvaluationItem {
  id: string;
  siteId: string;
  siteName: string;
  chiefId?: string;
  chiefName?: string;
  komandanId?: string;
  namaKomandan: string;
  komandanPosition?: string;
  komandanRole?: string;
  kedisiplinan: string;
  koordinasi: string;
  kehadiran: string;
  reguHadir?: string | number;
  reguIzin?: string | number;
  insiden: string;
  detailInsiden?: string;
  catatan?: string;
  statusLaporan?: string;
  tanggalLapor?: string;
  createdAt?: string;
}

export interface ChiefEvaluationDetailResponse {
  data: ChiefEvaluationItem;
}

// ----------------------------------------------------------------------------
// EXPORT LAPORAN TYPES & PARITY (PATROLI.SITE PARITY)
// ----------------------------------------------------------------------------

export interface ExportPersonnelAttendanceSummary {
  kehadiranCount: number;
  lupaPulangCount: number;
  izinSakitCount: number;
  terlambatCount: number;
  terlambatMenit: number;
  pulangAwalCount: number;
  pulangAwalMenit: number;
}

export interface ExportPersonnelAttendanceItem {
  no: number;
  tanggal: string;
  hari: string;
  absenMasuk: string;
  absenPulang: string;
  fotoMasuk?: string | null;
  fotoPulang?: string | null;
  keterangan: string;
  totalJamEfektif: string;
  statusRadius?: string;
  statusWaktu?: string;
}

export interface ExportPersonnelAttendanceResponse {
  namaPersonil: string;
  posisi: string;
  siteName: string;
  summary: ExportPersonnelAttendanceSummary;
  records: ExportPersonnelAttendanceItem[];
}

export interface ExportAreaAttendanceItem {
  no: number;
  namaPersonil: string;
  divisi: string;
  absenMasuk: string;
  absenPulang: string;
  fotoMasuk?: string | null;
  fotoPulang?: string | null;
  keterangan: string;
  totalJamEfektif: string;
}

export interface ExportAreaAttendanceResponse {
  siteName: string;
  kategori: string;
  records: ExportAreaAttendanceItem[];
}

export interface ExportPersonnelActivityItem {
  no: number;
  hari: string;
  tanggal: string;
  jam: string;
  deskripsiTugas: string;
  fotoKegiatan?: string | null;
  lokasiAset?: string;
}

export interface ExportPersonnelActivityResponse {
  namaPersonil: string;
  posisi: string;
  siteName: string;
  records: ExportPersonnelActivityItem[];
}

export interface ExportAreaActivityItem {
  no: number;
  namaPersonel: string;
  hari: string;
  tanggal: string;
  jam: string;
  deskripsiTugas: string;
  fotoKegiatan?: string | null;
  temuanDilaporkan?: string;
  statusTemuan?: string;
  catatanTindakLanjut?: string;
}

export interface ExportAreaActivityResponse {
  siteName: string;
  kategori: string;
  records: ExportAreaActivityItem[];
}


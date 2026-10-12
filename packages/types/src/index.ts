// ============================================================================
// ENTERPRISE PATROL & FACILITY MANAGEMENT SYSTEM - SHARED TYPES
// ============================================================================

// ----------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ----------------------------------------------------------------------------

export enum UserRole {
  ADMIN_SUPER = 'ADMIN_SUPER',
  OPS_MANAGER = 'OPS_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  SECURITY_OFFICER = 'SECURITY_OFFICER',
  CLEANER = 'CLEANER',
  DRIVER = 'DRIVER',
}

export enum Division {
  SECURITY = 'SECURITY',
  CLEANING = 'CLEANING',
  DRIVER = 'DRIVER',
}

export enum AttendanceStatus {
  IN = 'IN',
  OUT = 'OUT',
  SICK = 'SICK',
  PERMISSION = 'PERMISSION',
  ALPHA = 'ALPHA',
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
  siteId?: string | null;
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
  notes?: string | null;
  qrPayloadScanned: string;
  createdAt: string;
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
  attendanceId: string;
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
  patrolLogId: string;
  checkpointId: string;
  qrPayload: string;
  latitude: number;
  longitude: number;
  photoBase64?: string;
  condition: CheckpointCondition;
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

  // Real-time GPS Tracking
  'gps:update': (payload: { userId: string; fullName: string; division: Division; siteId: string; latitude: number; longitude: number; updatedAt: string }) => void;
}

export interface ClientToServerEvents {
  'join:site_room': (siteId: string) => void;
  'leave:site_room': (siteId: string) => void;
  'gps:broadcast': (payload: { siteId: number | string; latitude: number; longitude: number }) => void;
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../gateway/events.gateway';
import { saveBase64Image } from '../../common/utils/file-upload.util';

export interface StartTripDto {
  siteId: string;
  vehiclePlateNumber: string;
  vehicleType: string;
  originLocation: string;
  destinationLocation: string;
  odometerStart: number;
  tripNotes?: string;
  photoBase64?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompleteTripDto {
  odometerEnd: number;
  tripNotes?: string;
  photoBase64?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class DriverService {
  constructor(
    private db: DatabaseService,
    private eventsGateway: EventsGateway,
  ) {}

  async startTrip(driverId: string, data: StartTripDto) {
    // Check if driver has an existing in-progress trip
    const existing = await this.db.queryOne<any>(
      `SELECT id FROM driver_trip_logs WHERE driver_id = $1 AND trip_status = 'IN_PROGRESS' LIMIT 1`,
      [driverId],
    );

    if (existing) {
      throw new BadRequestException('Driver masih memiliki perjalanan aktif yang belum diselesaikan');
    }

    const photoKeyStart = data.photoBase64 ? saveBase64Image(data.photoBase64, 'driver', driverId) : null;

    const row = await this.db.queryOne<any>(
      `
      INSERT INTO driver_trip_logs (
        site_id, driver_id, vehicle_plate_number, vehicle_type,
        origin_location, destination_location, started_at, trip_status,
        odometer_start, trip_notes, photo_key_start
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, CURRENT_TIMESTAMP, 'IN_PROGRESS',
        $7, $8, $9
      )
      RETURNING 
        id, site_id AS "siteId", driver_id AS "driverId",
        vehicle_plate_number AS "vehiclePlateNumber",
        vehicle_type AS "vehicleType",
        origin_location AS "originLocation",
        destination_location AS "destinationLocation",
        started_at AS "startedAt",
        trip_status AS "tripStatus",
        odometer_start AS "odometerStart",
        trip_notes AS "tripNotes",
        photo_key_start AS "photoKeyStart"
    `,
      [
        data.siteId,
        driverId,
        data.vehiclePlateNumber,
        data.vehicleType,
        data.originLocation,
        data.destinationLocation,
        data.odometerStart,
        data.tripNotes || null,
        photoKeyStart,
      ],
    );

    const driver = await this.db.queryOne<any>(
      `SELECT full_name, username FROM users WHERE id = $1`,
      [driverId],
    );

    // Broadcast trip started to Command Center
    this.eventsGateway.server?.to(`site_${data.siteId}`).emit('driver:trip_started', {
      ...row,
      driverName: driver?.full_name || 'Driver Operasional',
    });

    return {
      ...row,
      driverName: driver?.full_name || 'Driver Operasional',
    };
  }

  async completeTrip(tripId: string, driverId: string, data: CompleteTripDto) {
    const trip = await this.db.queryOne<any>(
      `SELECT * FROM driver_trip_logs WHERE id = $1`,
      [tripId],
    );

    if (!trip) {
      throw new NotFoundException(`Perjalanan armada dengan ID ${tripId} tidak ditemukan`);
    }

    if (data.odometerEnd < trip.odometer_start) {
      throw new BadRequestException(
        `Odometer akhir (${data.odometerEnd}) tidak boleh lebih kecil dari odometer awal (${trip.odometer_start})`,
      );
    }

    const totalDistanceKm = data.odometerEnd - trip.odometer_start;
    const photoKeyEnd = data.photoBase64 ? saveBase64Image(data.photoBase64, 'driver', driverId) : null;

    const row = await this.db.queryOne<any>(
      `
      UPDATE driver_trip_logs
      SET trip_status = 'COMPLETED',
          arrived_at = CURRENT_TIMESTAMP,
          odometer_end = $2,
          trip_notes = COALESCE($3, trip_notes),
          photo_key_end = COALESCE($4, photo_key_end)
      WHERE id = $1
      RETURNING 
        id, site_id AS "siteId", driver_id AS "driverId",
        vehicle_plate_number AS "vehiclePlateNumber",
        vehicle_type AS "vehicleType",
        origin_location AS "originLocation",
        destination_location AS "destinationLocation",
        started_at AS "startedAt",
        arrived_at AS "arrivedAt",
        trip_status AS "tripStatus",
        odometer_start AS "odometerStart",
        odometer_end AS "odometerEnd",
        trip_notes AS "tripNotes",
        photo_key_start AS "photoKeyStart",
        photo_key_end AS "photoKeyEnd"
    `,
      [tripId, data.odometerEnd, data.tripNotes || null, photoKeyEnd],
    );

    // Broadcast trip completed to Command Center
    this.eventsGateway.server?.to(`site_${trip.site_id}`).emit('driver:trip_completed', {
      ...row,
      totalDistanceKm,
    });

    return {
      ...row,
      totalDistanceKm,
    };
  }

  async getActiveTrip(driverId: string) {
    return this.db.queryOne<any>(
      `
      SELECT 
        id, site_id AS "siteId", driver_id AS "driverId",
        vehicle_plate_number AS "vehiclePlateNumber",
        vehicle_type AS "vehicleType",
        origin_location AS "originLocation",
        destination_location AS "destinationLocation",
        started_at AS "startedAt",
        trip_status AS "tripStatus",
        odometer_start AS "odometerStart",
        trip_notes AS "tripNotes",
        photo_key_start AS "photoKeyStart"
      FROM driver_trip_logs
      WHERE driver_id = $1 AND trip_status = 'IN_PROGRESS'
      ORDER BY started_at DESC
      LIMIT 1
    `,
      [driverId],
    );
  }

  async getTrips(siteId?: string, limit = 50) {
    let sql = `
      SELECT 
        dtl.id,
        dtl.site_id AS "siteId",
        dtl.driver_id AS "driverId",
        dtl.vehicle_plate_number AS "vehiclePlateNumber",
        dtl.vehicle_type AS "vehicleType",
        dtl.origin_location AS "originLocation",
        dtl.destination_location AS "destinationLocation",
        dtl.started_at AS "startedAt",
        dtl.arrived_at AS "arrivedAt",
        dtl.trip_status AS "tripStatus",
        dtl.odometer_start AS "odometerStart",
        dtl.odometer_end AS "odometerEnd",
        COALESCE(dtl.odometer_end - dtl.odometer_start, 0) AS "distanceKm",
        dtl.trip_notes AS "tripNotes",
        dtl.photo_key_start AS "photoKeyStart",
        dtl.photo_key_end AS "photoKeyEnd",
        u.full_name AS "driverName",
        s.name AS "siteName"
      FROM driver_trip_logs dtl
      JOIN users u ON dtl.driver_id = u.id
      JOIN sites s ON dtl.site_id = s.id
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE dtl.site_id = $1`;
      params.push(siteId);
    }

    sql += ` ORDER BY dtl.started_at DESC LIMIT ${Math.min(limit, 100)}`;

    return this.db.query(sql, params);
  }
}

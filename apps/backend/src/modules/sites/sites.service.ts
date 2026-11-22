import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Site } from '@patrol/types';

@Injectable()
export class SitesService {
  constructor(private db: DatabaseService) {}

  async findAll(): Promise<Site[]> {
    const rows = await this.db.query<any>(`
      SELECT 
        id, code, name, address,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
        shift_pagi_in::text AS "shiftPagiIn",
        shift_pagi_out::text AS "shiftPagiOut",
        shift_siang_in::text AS "shiftSiangIn",
        shift_siang_out::text AS "shiftSiangOut",
        shift_malam_in::text AS "shiftMalamIn",
        shift_malam_out::text AS "shiftMalamOut",
        shift_staff_in::text AS "shiftStaffIn",
        shift_staff_out::text AS "shiftStaffOut",
        shift_chief_in::text AS "shiftChiefIn",
        shift_chief_out::text AS "shiftChiefOut",
        shift_pagi_in::text AS "shiftPagiMasuk",
        shift_pagi_out::text AS "shiftPagiPulang",
        shift_siang_in::text AS "shiftSiangMasuk",
        shift_siang_out::text AS "shiftSiangPulang",
        shift_malam_in::text AS "shiftMalamMasuk",
        shift_malam_out::text AS "shiftMalamPulang",
        shift_staff_in::text AS "shiftStafMasuk",
        shift_staff_out::text AS "shiftStafPulang",
        shift_chief_in::text AS "shiftChiefMasuk",
        shift_chief_out::text AS "shiftChiefPulang",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM sites
      WHERE is_active = true
      ORDER BY name ASC
    `);

    return rows.map((r) => ({
      ...r,
      code: r.code || r.id.substring(0, 8).toUpperCase(),
      city: 'Indonesia',
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    }));
  }

  async findById(id: string): Promise<Site> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        id, code, name, address,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
        shift_pagi_in::text AS "shiftPagiIn",
        shift_pagi_out::text AS "shiftPagiOut",
        shift_siang_in::text AS "shiftSiangIn",
        shift_siang_out::text AS "shiftSiangOut",
        shift_malam_in::text AS "shiftMalamIn",
        shift_malam_out::text AS "shiftMalamOut",
        shift_staff_in::text AS "shiftStaffIn",
        shift_staff_out::text AS "shiftStaffOut",
        shift_chief_in::text AS "shiftChiefIn",
        shift_chief_out::text AS "shiftChiefOut",
        shift_pagi_in::text AS "shiftPagiMasuk",
        shift_pagi_out::text AS "shiftPagiPulang",
        shift_siang_in::text AS "shiftSiangMasuk",
        shift_siang_out::text AS "shiftSiangPulang",
        shift_malam_in::text AS "shiftMalamMasuk",
        shift_malam_out::text AS "shiftMalamPulang",
        shift_staff_in::text AS "shiftStafMasuk",
        shift_staff_out::text AS "shiftStafPulang",
        shift_chief_in::text AS "shiftChiefMasuk",
        shift_chief_out::text AS "shiftChiefPulang",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM sites
      WHERE id = $1
    `,
      [id],
    );

    if (!row) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }

    return {
      ...row,
      code: row.code || row.id.substring(0, 8).toUpperCase(),
      city: 'Indonesia',
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    };
  }

  async create(data: Partial<Site>): Promise<Site> {
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO sites (name, address, coordinates, geofence_radius_meters, is_active)
      VALUES (
        $1, $2,
        ST_SetSRID(ST_MakePoint(($4)::double precision, ($3)::double precision), 4326),
        $5, $6
      )
      RETURNING 
        id, name, address,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
      [
        data.name,
        data.address,
        Number(data.latitude),
        Number(data.longitude),
        data.geofenceRadiusMeters || 100,
        data.isActive ?? true,
      ],
    );

    return {
      ...row,
      code: row.id.substring(0, 8).toUpperCase(),
      city: 'Indonesia',
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    };
  }

  async verifyGeofence(siteId: string, lat: number, lon: number) {
    return this.db.checkSiteGeofence(siteId, lat, lon);
  }
}

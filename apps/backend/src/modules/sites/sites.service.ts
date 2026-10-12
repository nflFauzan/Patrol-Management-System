import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Site } from '@patrol/types';

@Injectable()
export class SitesService {
  constructor(private db: DatabaseService) {}

  async findAll(): Promise<Site[]> {
    const rows = await this.db.query<any>(`
      SELECT 
        id, code, name, description, address, city,
        ST_Y(geofence_center::geometry) AS latitude,
        ST_X(geofence_center::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM sites
      WHERE is_active = true
      ORDER BY name ASC
    `);

    return rows.map((r) => ({
      ...r,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    }));
  }

  async findById(id: string): Promise<Site> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        id, code, name, description, address, city,
        ST_Y(geofence_center::geometry) AS latitude,
        ST_X(geofence_center::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
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
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    };
  }

  async create(data: Partial<Site>): Promise<Site> {
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO sites (code, name, description, address, city, geofence_center, geofence_radius_meters, is_active)
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography,
        $8, $9
      )
      RETURNING 
        id, code, name, description, address, city,
        ST_Y(geofence_center::geometry) AS latitude,
        ST_X(geofence_center::geometry) AS longitude,
        geofence_radius_meters AS "geofenceRadiusMeters",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
      [
        data.code,
        data.name,
        data.description || null,
        data.address,
        data.city,
        data.latitude,
        data.longitude,
        data.geofenceRadiusMeters || 100,
        data.isActive ?? true,
      ],
    );

    return {
      ...row,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    };
  }

  async verifyGeofence(siteId: string, lat: number, lon: number) {
    return this.db.checkSiteGeofence(siteId, lat, lon);
  }
}

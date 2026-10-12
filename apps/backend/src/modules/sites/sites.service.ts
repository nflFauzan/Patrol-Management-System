import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Site } from '@patrol/types';

@Injectable()
export class SitesService {
  constructor(private db: DatabaseService) {}

  async findAll(): Promise<Site[]> {
    const rows = await this.db.query<any>(`
      SELECT 
        id, name, address,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
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
      code: r.id.substring(0, 8).toUpperCase(),
      city: 'Indonesia',
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    }));
  }

  async findById(id: string): Promise<Site> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        id, name, address,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
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
      code: row.id.substring(0, 8).toUpperCase(),
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
        ST_SetSRID(ST_MakePoint($4, $3), 4326)::geography,
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
        data.latitude,
        data.longitude,
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

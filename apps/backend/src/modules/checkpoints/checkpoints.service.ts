import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CheckpointItem {
  id: string;
  siteId: string;
  qrCodeToken: string;
  category: string;
  name: string;
  locationDetail?: string;
  taskDescription?: string;
  latitude: number;
  longitude: number;
  allowedDistanceMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CheckpointsService {
  constructor(private db: DatabaseService) {}

  async findBySite(siteId: string, category?: string): Promise<CheckpointItem[]> {
    let query = `
      SELECT 
        c.id, 
        c.site_id AS "siteId", 
        c.qr_code_token AS "qrCodeToken", 
        c.category, 
        c.name, 
        c.location_detail AS "locationDetail",
        c.task_description AS "taskDescription",
        ST_Y(s.coordinates::geometry) AS latitude,
        ST_X(s.coordinates::geometry) AS longitude,
        s.geofence_radius_meters AS "allowedDistanceMeters",
        c.is_active AS "isActive",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM checkpoints c
      JOIN sites s ON c.site_id = s.id
      WHERE c.site_id = $1 AND c.is_active = true
    `;
    const params: any[] = [siteId];

    if (category) {
      query += ` AND c.category ILIKE $2`;
      params.push(`%${category}%`);
    }

    query += ` ORDER BY c.name ASC`;

    const rows = await this.db.query<any>(query, params);
    return rows.map((r) => ({
      ...r,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      allowedDistanceMeters: Number(r.allowedDistanceMeters),
    }));
  }

  async findById(id: string): Promise<CheckpointItem> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        c.id, 
        c.site_id AS "siteId", 
        c.qr_code_token AS "qrCodeToken", 
        c.category, 
        c.name, 
        c.location_detail AS "locationDetail",
        c.task_description AS "taskDescription",
        ST_Y(s.coordinates::geometry) AS latitude,
        ST_X(s.coordinates::geometry) AS longitude,
        s.geofence_radius_meters AS "allowedDistanceMeters",
        c.is_active AS "isActive",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM checkpoints c
      JOIN sites s ON c.site_id = s.id
      WHERE c.id = $1
    `,
      [id],
    );

    if (!row) {
      throw new NotFoundException(`Checkpoint with ID ${id} not found`);
    }

    return {
      ...row,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      allowedDistanceMeters: Number(row.allowedDistanceMeters),
    };
  }

  async findByQrToken(qrToken: string): Promise<CheckpointItem> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        c.id, 
        c.site_id AS "siteId", 
        c.qr_code_token AS "qrCodeToken", 
        c.category, 
        c.name, 
        c.location_detail AS "locationDetail",
        c.task_description AS "taskDescription",
        ST_Y(s.coordinates::geometry) AS latitude,
        ST_X(s.coordinates::geometry) AS longitude,
        s.geofence_radius_meters AS "allowedDistanceMeters",
        c.is_active AS "isActive",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM checkpoints c
      JOIN sites s ON c.site_id = s.id
      WHERE c.qr_code_token = $1 AND c.is_active = true
    `,
      [qrToken],
    );

    if (!row) {
      throw new NotFoundException(`Checkpoint with QR Code "${qrToken}" not found`);
    }

    return {
      ...row,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      allowedDistanceMeters: Number(row.allowedDistanceMeters),
    };
  }

  async create(data: {
    siteId: string;
    qrCodeToken: string;
    category?: string;
    name: string;
    locationDetail?: string;
    taskDescription?: string;
    isActive?: boolean;
  }): Promise<CheckpointItem> {
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO checkpoints (
        site_id, qr_code_token, category, name, location_detail, task_description, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
      [
        data.siteId,
        data.qrCodeToken,
        data.category || 'Security',
        data.name,
        data.locationDetail || null,
        data.taskDescription || null,
        data.isActive ?? true,
      ],
    );

    return this.findById(row.id);
  }
}

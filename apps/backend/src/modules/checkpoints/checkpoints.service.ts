import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Checkpoint, Division } from '@patrol/types';

@Injectable()
export class CheckpointsService {
  constructor(private db: DatabaseService) {}

  async findBySite(siteId: string, division?: Division): Promise<Checkpoint[]> {
    let query = `
      SELECT 
        id, site_id AS "siteId", division, code, name, location_description AS "locationDescription",
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        allowed_distance_meters AS "allowedDistanceMeters",
        qr_payload AS "qrPayload",
        sequence_order AS "sequenceOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM checkpoints
      WHERE site_id = $1 AND is_active = true
    `;
    const params: any[] = [siteId];

    if (division) {
      query += ` AND division = $2`;
      params.push(division);
    }

    query += ` ORDER BY sequence_order ASC, name ASC`;

    const rows = await this.db.query<any>(query, params);
    return rows.map((r) => ({
      ...r,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
    }));
  }

  async findById(id: string): Promise<Checkpoint> {
    const row = await this.db.queryOne<any>(
      `
      SELECT 
        id, site_id AS "siteId", division, code, name, location_description AS "locationDescription",
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        allowed_distance_meters AS "allowedDistanceMeters",
        qr_payload AS "qrPayload",
        sequence_order AS "sequenceOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM checkpoints
      WHERE id = $1
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
    };
  }

  async create(data: Partial<Checkpoint>): Promise<Checkpoint> {
    const row = await this.db.queryOne<any>(
      `
      INSERT INTO checkpoints (
        site_id, division, code, name, location_description, coordinates,
        allowed_distance_meters, qr_payload, sequence_order, is_active
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography,
        $8, $9, $10, $11
      )
      RETURNING 
        id, site_id AS "siteId", division, code, name, location_description AS "locationDescription",
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        allowed_distance_meters AS "allowedDistanceMeters",
        qr_payload AS "qrPayload",
        sequence_order AS "sequenceOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
      [
        data.siteId,
        data.division || Division.SECURITY,
        data.code,
        data.name,
        data.locationDescription || null,
        data.latitude,
        data.longitude,
        data.allowedDistanceMeters || 30,
        data.qrPayload || data.code,
        data.sequenceOrder || 1,
        data.isActive ?? true,
      ],
    );

    return {
      ...row,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    };
  }
}

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
      WHERE (c.qr_code_token = $1 OR c.qr_code_token ILIKE $1 OR c.id::text = $1) AND c.is_active = true
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

  async bulkImport(items: any[]): Promise<{ importedCount: number; errors: string[] }> {
    let importedCount = 0;
    const errors: string[] = [];

    const sites = await this.db.query<any>(`SELECT id, name FROM sites WHERE is_active = true`);
    const siteMap = new Map<string, string>();
    for (const s of sites) {
      siteMap.set(s.name.trim().toLowerCase(), s.id);
      siteMap.set(s.id, s.id);
    }

    const defaultSiteId = sites.length > 0 ? sites[0].id : null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const siteId = (item.siteCodeOrName && siteMap.get(item.siteCodeOrName.trim().toLowerCase())) 
          || (item.siteId && siteMap.get(item.siteId)) 
          || defaultSiteId;

        if (!siteId) {
          errors.push(`Row ${i + 1}: Site "${item.siteCodeOrName || item.siteId}" not found`);
          continue;
        }

        const qrToken = item.qrPayload || item.qrCodeToken || `CP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await this.db.query(
          `INSERT INTO checkpoints (site_id, qr_code_token, category, name, location_detail, task_description, asset_type, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)
           ON CONFLICT (qr_code_token) DO UPDATE 
           SET name = EXCLUDED.name, location_detail = EXCLUDED.location_detail, task_description = EXCLUDED.task_description, asset_type = EXCLUDED.asset_type`,
          [
            siteId,
            qrToken,
            item.kategori || item.category || 'Security',
            item.namaAset || item.name,
            item.lokasi || item.locationDetail || '',
            item.deskripsiTugas || item.taskDescription || '',
            item.jenisAset || item.assetType || 'General Asset',
          ],
        );
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { importedCount, errors };
  }

  getImportTemplate(): string {
    return 'namaAset,kategori,lokasi,deskripsiTugas,jenisAset,siteCodeOrName\n' +
      'Pos Gerbang Utama,Security,Gerbang Depan,Pemeriksaan Akses Masuk Tamu,Pos Jaga,Site Proyek Demo\n' +
      'Toilet Lantai 1,Cleaning Service,Lobby Utama,Pembersihan Sanitasi Berkala,Sanitasi,Site Proyek Demo';
  }
}

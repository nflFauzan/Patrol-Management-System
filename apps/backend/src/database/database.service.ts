import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USER', 'patrol_admin'),
      password: this.configService.get<string>('DB_PASSWORD', 'patrol_secret_2026'),
      database: this.configService.get<string>('DB_NAME', 'patrol_management'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT version(), PostGIS_Full_Version()');
      this.logger.log(`PostgreSQL & PostGIS Connected: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]}`);
      client.release();
    } catch (err: any) {
      this.logger.warn(`PostgreSQL connection failed during init (is Docker container running?): ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
    const res: QueryResult<T> = await this.pool.query(text, params);
    return res.rows;
  }

  async queryOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Spatial verification using PostGIS ST_DWithin
   */
  async checkSiteGeofence(siteId: string, latitude: number, longitude: number): Promise<{
    isWithin: boolean;
    distanceMeters: number;
    siteName: string;
    geofenceRadiusMeters: number;
  }> {
    const sql = `
      SELECT 
        name,
        geofence_radius_meters,
        ST_Distance(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
        ) AS distance_meters,
        ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
          geofence_radius_meters
        ) AS is_within
      FROM sites
      WHERE id = $1 AND is_active = true
    `;
    const result = await this.queryOne<{
      name: string;
      geofence_radius_meters: number;
      distance_meters: number;
      is_within: boolean;
    }>(sql, [siteId, longitude, latitude]);

    if (!result) {
      throw new Error(`Site with ID ${siteId} not found or inactive`);
    }

    return {
      isWithin: result.is_within,
      distanceMeters: Math.round(Number(result.distance_meters)),
      siteName: result.name,
      geofenceRadiusMeters: result.geofence_radius_meters,
    };
  }

  /**
   * Checkpoint proximity verification
   */
  async checkCheckpointProximity(checkpointId: string, latitude: number, longitude: number): Promise<{
    isWithin: boolean;
    distanceMeters: number;
    checkpointName: string;
    allowedDistanceMeters: number;
  }> {
    const sql = `
      SELECT 
        name,
        allowed_distance_meters,
        ST_Distance(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
        ) AS distance_meters,
        ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
          allowed_distance_meters
        ) AS is_within
      FROM checkpoints
      WHERE id = $1 AND is_active = true
    `;
    const result = await this.queryOne<{
      name: string;
      allowed_distance_meters: number;
      distance_meters: number;
      is_within: boolean;
    }>(sql, [checkpointId, longitude, latitude]);

    if (!result) {
      throw new Error(`Checkpoint with ID ${checkpointId} not found or inactive`);
    }

    return {
      isWithin: result.is_within,
      distanceMeters: Math.round(Number(result.distance_meters)),
      checkpointName: result.name,
      allowedDistanceMeters: result.allowed_distance_meters,
    };
  }
}

-- ============================================================================
-- 012_operational_enhancements.sql
-- Fleet Return Log (Odometer End, GPS, Photos) & Cleaning 6 Sub-Checklists
-- ============================================================================

-- 1. driver_trip_logs enhancements
ALTER TABLE driver_trip_logs 
ADD COLUMN IF NOT EXISTS photo_key_start TEXT,
ADD COLUMN IF NOT EXISTS photo_key_end TEXT,
ADD COLUMN IF NOT EXISTS start_coordinates GEOMETRY(Point, 4326),
ADD COLUMN IF NOT EXISTS end_coordinates GEOMETRY(Point, 4326);

-- 2. cleaning_checklists 6 sub-checklists enhancements
ALTER TABLE cleaning_checklists 
ADD COLUMN IF NOT EXISTS soap_restocked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mirror_cleaned BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS tissue_restocked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS odor_freshened BOOLEAN DEFAULT TRUE;

-- 3. staff_activity_logs photo enhancement
ALTER TABLE staff_activity_logs 
ADD COLUMN IF NOT EXISTS photo_key TEXT;


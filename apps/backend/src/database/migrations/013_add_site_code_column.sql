-- Migration 013: Add site code column and ensure uniqueness
ALTER TABLE sites ADD COLUMN IF NOT EXISTS code VARCHAR(20);

UPDATE sites 
SET code = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g') FROM 1 FOR 7)) || '-' || SUBSTRING(id::text FROM 1 FOR 4)
WHERE code IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sites_code_unique'
  ) THEN
    ALTER TABLE sites ADD CONSTRAINT sites_code_unique UNIQUE (code);
  END IF;
END $$;

/*
  # Create Areas Table

  1. New Tables
    - `areas`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Area name (e.g., Ubud, Kintamani, Kuta, East Bali, Lovina)
      - `description` (text) - Optional description of the area
      - `created_at` (timestamptz) - Timestamp when area was created
      - `updated_at` (timestamptz) - Timestamp when area was last updated
  
  2. Security
    - Enable RLS on `areas` table
    - Add policy for authenticated users to read areas
    - Add policy for admin users to insert/update/delete areas

  3. Indexes
    - Add index on name for fast lookups
*/

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read areas"
  ON areas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert areas"
  ON areas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update areas"
  ON areas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete areas"
  ON areas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_areas_name ON areas(name);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER areas_updated_at
  BEFORE UPDATE ON areas
  FOR EACH ROW
  EXECUTE FUNCTION update_areas_updated_at();
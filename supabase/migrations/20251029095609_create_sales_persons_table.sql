/*
  # Create Sales Persons Table

  1. New Tables
    - `sales_persons`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `password_hash` (text, not null) - Store hashed password
      - `company_name` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `created_by` (uuid, foreign key to profiles)

  2. Security
    - Enable RLS on `sales_persons` table
    - Add policy for admins to manage sales persons
    - Add policy for sales persons to read their own data

  3. Indexes
    - Index on email for fast lookups
*/

-- Create sales_persons table
CREATE TABLE IF NOT EXISTS sales_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  company_name text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id)
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_sales_persons_email ON sales_persons(email);

-- Create index on is_active
CREATE INDEX IF NOT EXISTS idx_sales_persons_active ON sales_persons(is_active);

-- Enable RLS
ALTER TABLE sales_persons ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all sales persons
CREATE POLICY "Admins can read all sales persons"
  ON sales_persons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to insert sales persons
CREATE POLICY "Admins can insert sales persons"
  ON sales_persons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to update sales persons
CREATE POLICY "Admins can update sales persons"
  ON sales_persons FOR UPDATE
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

-- Policy for admins to delete sales persons
CREATE POLICY "Admins can delete sales persons"
  ON sales_persons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy for sales persons to read their own data
CREATE POLICY "Sales persons can read own data"
  ON sales_persons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = sales_persons.email
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sales_persons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_sales_persons_timestamp ON sales_persons;
CREATE TRIGGER update_sales_persons_timestamp
  BEFORE UPDATE ON sales_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_persons_updated_at();
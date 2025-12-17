-- Create Website Content Management Tables
-- 
-- 1. New Tables
--    - packages: Travel packages displayed on landing page
--    - promotions: Special offers and discounts
-- 
-- 2. Security
--    - Enable RLS on both tables
--    - Public can read active items
--    - Only admins can create/update/delete
-- 
-- 3. Indexes
--    - Index on is_active for fast filtering
--    - Index on display_order for sorting

-- Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  price_from numeric NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  highlights jsonb DEFAULT '[]'::jsonb,
  inclusions text DEFAULT '',
  exclusions text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  discount_percentage integer DEFAULT 0,
  valid_from date,
  valid_until date,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Anyone can view active packages"
  ON public.packages
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all packages"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert packages"
  ON public.packages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update packages"
  ON public.packages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete packages"
  ON public.packages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for promotions
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions
  FOR SELECT
  USING (is_active = true AND valid_until >= CURRENT_DATE);

CREATE POLICY "Admins can view all promotions"
  ON public.promotions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert promotions"
  ON public.promotions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update promotions"
  ON public.promotions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete promotions"
  ON public.promotions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_display_order ON public.packages(display_order);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON public.packages(is_featured);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON public.promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_valid_dates ON public.promotions(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_promotions_display_order ON public.promotions(display_order);
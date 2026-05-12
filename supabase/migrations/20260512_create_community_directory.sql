-- Create community_directory table
CREATE TABLE community_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  family_name VARCHAR(255) NOT NULL,
  
  -- Community Information
  community_type VARCHAR(100) NOT NULL, -- e.g., 'Chettiar', etc.
  gothram VARCHAR(100), -- optional
  
  -- Location Details
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  
  -- Contact Information
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  
  -- Professional Details
  profession VARCHAR(255),
  
  -- Content
  description TEXT,
  function_type VARCHAR(100), -- e.g., 'Wedding', 'Ear Piercing', 'House Warming', 'Temple Function', 'Business', 'Others'
  
  -- Images - store as JSON array of URLs
  image_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Privacy Controls
  is_public BOOLEAN DEFAULT true,
  is_community_only BOOLEAN DEFAULT false, -- only visible to same community
  hide_address BOOLEAN DEFAULT false,
  
  -- Admin Approval
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For search optimization
  search_text TSVECTOR,
  
  CONSTRAINT valid_community_type CHECK (community_type != ''),
  CONSTRAINT valid_district CHECK (district != ''),
  CONSTRAINT valid_city CHECK (city != ''),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{7,}$')
);

-- Create indexes for better search performance
CREATE INDEX idx_community_directory_user_id ON community_directory(user_id);
CREATE INDEX idx_community_directory_approved ON community_directory(is_approved);
CREATE INDEX idx_community_directory_community_type ON community_directory(community_type);
CREATE INDEX idx_community_directory_district ON community_directory(district);
CREATE INDEX idx_community_directory_city ON community_directory(city);
CREATE INDEX idx_community_directory_family_name ON community_directory(family_name);
CREATE INDEX idx_community_directory_function_type ON community_directory(function_type);
CREATE INDEX idx_community_directory_created_at ON community_directory(created_at DESC);
CREATE INDEX idx_community_directory_search ON community_directory USING GIN(search_text);

-- Create a function to update search_text automatically
CREATE OR REPLACE FUNCTION update_community_directory_search_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := 
    TO_TSVECTOR('english', COALESCE(NEW.full_name, '')) ||
    TO_TSVECTOR('english', COALESCE(NEW.family_name, '')) ||
    TO_TSVECTOR('english', COALESCE(NEW.profession, '')) ||
    TO_TSVECTOR('english', COALESCE(NEW.city, '')) ||
    TO_TSVECTOR('english', COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update search_text
CREATE TRIGGER trigger_update_community_directory_search
BEFORE INSERT OR UPDATE ON community_directory
FOR EACH ROW
EXECUTE FUNCTION update_community_directory_search_text();

-- Create a function to update updated_at
CREATE OR REPLACE FUNCTION update_community_directory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updated_at
CREATE TRIGGER trigger_update_community_directory_updated_at
BEFORE UPDATE ON community_directory
FOR EACH ROW
EXECUTE FUNCTION update_community_directory_updated_at();

-- Enable RLS
ALTER TABLE community_directory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view approved public listings
CREATE POLICY "view_approved_public_listings" ON community_directory
  FOR SELECT
  USING (is_approved = true AND is_public = true);

-- Users can view community-only listings if same community
CREATE POLICY "view_community_listings" ON community_directory
  FOR SELECT
  USING (
    is_approved = true AND 
    is_community_only = true AND
    community_type = (
      SELECT community_type FROM community_directory 
      WHERE id = auth.uid()::text LIMIT 1
    )
  );

-- Users can view their own listings
CREATE POLICY "view_own_listings" ON community_directory
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own listings
CREATE POLICY "insert_own_listings" ON community_directory
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own listings
CREATE POLICY "update_own_listings" ON community_directory
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own listings
CREATE POLICY "delete_own_listings" ON community_directory
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin-specific policy to view all listings for approval
CREATE POLICY "admin_view_all_listings" ON community_directory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Admin can approve listings
CREATE POLICY "admin_approve_listings" ON community_directory
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create a view for public listings
CREATE OR REPLACE VIEW community_directory_public AS
SELECT 
  id,
  full_name,
  family_name,
  community_type,
  district,
  city,
  CASE WHEN hide_address THEN NULL ELSE address END as address,
  phone,
  whatsapp,
  email,
  profession,
  description,
  function_type,
  image_urls,
  created_at
FROM community_directory
WHERE is_approved = true AND is_public = true;

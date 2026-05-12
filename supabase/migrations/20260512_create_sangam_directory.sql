-- Sangam Directory Tables

-- Create districts table
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  name_tamil VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  name_tamil VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sangams table
CREATE TABLE sangams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sangam_name VARCHAR(255) NOT NULL,
  sangam_name_tamil VARCHAR(255),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  office_timing VARCHAR(255),
  map_link VARCHAR(500),
  image_url VARCHAR(500),
  contact_person VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sangam_registrations table (for user submissions)
CREATE TABLE sangam_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sangam_name VARCHAR(255) NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id),
  district_id UUID NOT NULL REFERENCES districts(id),
  city VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  office_timing VARCHAR(255),
  contact_person VARCHAR(255),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_sangams_district ON sangams(district_id);
CREATE INDEX idx_sangams_community ON sangams(community_id);
CREATE INDEX idx_sangams_status ON sangams(status);
CREATE INDEX idx_sangams_city ON sangams(city);

-- Insert sample data: Districts
INSERT INTO districts (name, name_tamil) VALUES
  ('Thanjavur', 'தஞ்சாவூர்'),
  ('Karaikudi', 'கரைக்குடி'),
  ('Chennai', 'சென்னை'),
  ('Tiruppur', 'திருப்பூர்'),
  ('Coimbatore', 'கோயம்புத்தூர்'),
  ('Madurai', 'மதுரை'),
  ('Salem', 'சேலம்'),
  ('Kancheepuram', 'காঞ்சிபுரம்');

-- Insert sample data: Communities
INSERT INTO communities (name, name_tamil) VALUES
  ('Chettiar', 'செட்டியார்'),
  ('Nagarathar', 'நாகரத்தார்'),
  ('Vaniya Chettiar', 'வணிய செட்டியார்'),
  ('Mudaliar', 'முதலியார்'),
  ('Chetty', 'சேட்டி'),
  ('Naidu', 'నాయిడు');

-- Insert sample Sangams
INSERT INTO sangams (sangam_name, sangam_name_tamil, community_id, district_id, city, address, phone, whatsapp, email, description, office_timing, contact_person, status)
SELECT 
  'Thanjavur Chettiar Sangam',
  'தஞ்சாவூர் செட்டியார் சங்கம்',
  c.id,
  d.id,
  'Thanjavur',
  '123 Main Street, Thanjavur',
  '+91 9876543210',
  '+91 9876543210',
  'info@thanjavurchettiar.com',
  'Premier Chettiar community organization in Thanjavur promoting cultural heritage and community welfare',
  '9:00 AM - 6:00 PM',
  'Mr. Ramakrishnan',
  'approved'
FROM communities c, districts d
WHERE c.name = 'Chettiar' AND d.name = 'Thanjavur'
LIMIT 1;

INSERT INTO sangams (sangam_name, sangam_name_tamil, community_id, district_id, city, address, phone, whatsapp, email, description, office_timing, contact_person, status)
SELECT 
  'Karaikudi Nagarathar Sangam',
  'கரைக்குடி நாகரத்தார் சங்கம்',
  c.id,
  d.id,
  'Karaikudi',
  '456 Heritage Road, Karaikudi',
  '+91 8765432109',
  '+91 8765432109',
  'info@karaikudisangam.com',
  'Oldest Nagarathar community organization dedicated to preserving traditions',
  '10:00 AM - 5:00 PM',
  'Mr. Krishnamurthy',
  'approved'
FROM communities c, districts d
WHERE c.name = 'Nagarathar' AND d.name = 'Karaikudi'
LIMIT 1;

INSERT INTO sangams (sangam_name, sangam_name_tamil, community_id, district_id, city, address, phone, whatsapp, email, description, office_timing, contact_person, status)
SELECT 
  'Chennai Vaniya Chettiar Sangam',
  'சென்னை வணிய செட்டியார் சங்கம்',
  c.id,
  d.id,
  'Chennai',
  '789 Prosperity Street, Mylapore, Chennai',
  '+91 7654321098',
  '+91 7654321098',
  'info@chennaivaniasangam.com',
  'Progressive Vaniya Chettiar organization focusing on education and social service',
  '9:30 AM - 6:30 PM',
  'Mr. Sundarraman',
  'approved'
FROM communities c, districts d
WHERE c.name = 'Vaniya Chettiar' AND d.name = 'Chennai'
LIMIT 1;

-- Create view for approved sangams
CREATE VIEW approved_sangams AS
SELECT * FROM sangams WHERE status = 'approved';

-- Enable RLS (Row Level Security)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sangams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sangam_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anyone to read approved sangams and lookups
CREATE POLICY "Allow public read on districts" ON districts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on communities" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Allow public read approved sangams" ON sangams
  FOR SELECT USING (status = 'approved');

-- Allow users to read their own registrations
CREATE POLICY "Allow users read own registrations" ON sangam_registrations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'email' = 'admin@chettiarconnect.com'
  );

-- Allow authenticated users to insert registrations
CREATE POLICY "Allow authenticated insert registrations" ON sangam_registrations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin access
CREATE POLICY "Allow admin full access" ON sangams
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'admin@chettiarconnect.com'
  );

CREATE POLICY "Allow admin full access to registrations" ON sangam_registrations
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'admin@chettiarconnect.com'
  );

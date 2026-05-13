-- Make user_id optional to allow guest submissions
ALTER TABLE community_directory
ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_email column for tracking guest submissions
ALTER TABLE community_directory
ADD COLUMN guest_email VARCHAR(255),
ADD COLUMN guest_phone VARCHAR(20);

-- Add a check to ensure either user_id or (guest_email and guest_phone) is provided
ALTER TABLE community_directory
ADD CONSTRAINT user_or_guest_submission CHECK (
  user_id IS NOT NULL OR (guest_email IS NOT NULL AND guest_phone IS NOT NULL)
);

-- Create an index for guest submissions
CREATE INDEX idx_community_directory_guest_email ON community_directory(guest_email);
CREATE INDEX idx_community_directory_guest_phone ON community_directory(guest_phone);

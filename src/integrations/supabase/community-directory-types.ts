// src/integrations/supabase/community-directory-types.ts

// src/integrations/supabase/community-directory-types.ts

export type FunctionType = 'Wedding' | 'Ear Piercing' | 'House Warming' | 'Temple Function' | 'Business' | 'Others';

export interface CommunityDirectoryListing {
  id: string;
  user_id: string | null;
  guest_email?: string;
  guest_phone?: string;
  full_name: string;
  family_name: string;
  community_type: string;
  gothram?: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  profession?: string;
  description?: string;
  function_type?: FunctionType;
  image_urls: string[];
  is_public: boolean;
  is_community_only: boolean;
  hide_address: boolean;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityDirectoryInput {
  full_name: string;
  family_name: string;
  community_type: string;
  gothram?: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  profession?: string;
  description?: string;
  function_type?: FunctionType;
  image_urls?: string[];
  is_public?: boolean;
  is_community_only?: boolean;
  hide_address?: boolean;
}

export interface CommunityDirectorySearchFilters {
  district?: string;
  city?: string;
  community_type?: string;
  family_name?: string;
  function_type?: FunctionType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommunityDirectoryStats {
  total_listings: number;
  approved_listings: number;
  pending_listings: number;
  recent_listings: number;
}

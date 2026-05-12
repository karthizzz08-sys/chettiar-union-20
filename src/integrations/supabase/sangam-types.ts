// src/integrations/supabase/sangam-types.ts

export interface District {
  id: string;
  name: string;
  name_tamil: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  name_tamil: string;
  created_at: string;
}

export interface Sangam {
  id: string;
  sangam_name: string;
  sangam_name_tamil?: string;
  community_id: string;
  district_id: string;
  city: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  description?: string;
  office_timing?: string;
  map_link?: string;
  image_url?: string;
  contact_person?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  community?: Community;
  district?: District;
}

export interface SangamRegistration {
  id: string;
  sangam_name: string;
  community_id: string;
  district_id: string;
  city: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  description?: string;
  office_timing?: string;
  contact_person?: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SangamFilters {
  district_id?: string;
  community_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

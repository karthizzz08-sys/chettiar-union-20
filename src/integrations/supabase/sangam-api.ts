// src/integrations/supabase/sangam-api.ts
import { supabase } from './client';
import { supabaseAdmin } from './client.server';
import type {
  Sangam,
  District,
  Community,
  SangamRegistration,
  SangamFilters,
} from './sangam-types';

// Districts
export async function getDistricts(): Promise<District[]> {
  const { data, error } = await supabase.from('districts').select('*').order('name');
  if (error) throw error;
  return data || [];
}

// Communities
export async function getCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

// Get all approved Sangams with optional filters
export async function getSangams(filters?: SangamFilters): Promise<Sangam[]> {
  let query = supabase
    .from('sangams')
    .select('*, community:communities(id,name,name_tamil), district:districts(id,name,name_tamil)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (filters?.district_id) {
    query = query.eq('district_id', filters.district_id);
  }

  if (filters?.community_id) {
    query = query.eq('community_id', filters.community_id);
  }

  if (filters?.search) {
    query = query.or(
      `sangam_name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
    );
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get popular Sangams (most recent approved)
export async function getPopularSangams(limit: number = 6): Promise<Sangam[]> {
  return getSangams({ limit, offset: 0 });
}

// Get single Sangam
export async function getSangam(id: string): Promise<Sangam | null> {
  const { data, error } = await supabase
    .from('sangams')
    .select('*, community:communities(id,name,name_tamil), district:districts(id,name,name_tamil)')
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error) throw error;
  return data;
}

// Register a new Sangam
export async function registerSangam(
  registration: Omit<SangamRegistration, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<SangamRegistration> {
  const { data, error } = await supabase
    .from('sangam_registrations')
    .insert([{ ...registration, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin functions
export async function getAllSangamRegistrations(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<SangamRegistration[]> {
  let query = supabaseAdmin.from('sangam_registrations').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function approveSangamRegistration(registrationId: string): Promise<Sangam> {
  // Get the registration
  const { data: registration, error: regError } = await supabaseAdmin
    .from('sangam_registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (regError) throw regError;

  // Create Sangam from registration
  const { data: sangam, error: sangamError } = await supabaseAdmin
    .from('sangams')
    .insert([
      {
        sangam_name: registration.sangam_name,
        community_id: registration.community_id,
        district_id: registration.district_id,
        city: registration.city,
        address: registration.address,
        phone: registration.phone,
        whatsapp: registration.whatsapp,
        email: registration.email,
        description: registration.description,
        office_timing: registration.office_timing,
        contact_person: registration.contact_person,
        status: 'approved',
        created_by: registration.user_id,
      },
    ])
    .select()
    .single();

  if (sangamError) throw sangamError;

  // Update registration status
  await supabaseAdmin
    .from('sangam_registrations')
    .update({ status: 'approved' })
    .eq('id', registrationId);

  return sangam;
}

export async function rejectSangamRegistration(registrationId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('sangam_registrations')
    .update({ status: 'rejected' })
    .eq('id', registrationId);

  if (error) throw error;
}

export async function deleteSangam(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('sangams').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSangam(
  id: string,
  updates: Partial<Sangam>
): Promise<Sangam> {
  const { data, error } = await supabaseAdmin
    .from('sangams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Search Sangams by district name
export async function searchSangamsByDistrict(districtName: string): Promise<Sangam[]> {
  const { data: district } = await supabase
    .from('districts')
    .select('id')
    .ilike('name', `%${districtName}%`)
    .single();

  if (!district) return [];

  return getSangams({ district_id: district.id });
}

// Get Sangams count by district
export async function getSangamsCountByDistrict(): Promise<
  Array<{ district: string; count: number }>
> {
  const { data, error } = await supabase
    .from('sangams')
    .select('district_id,districts(name)')
    .eq('status', 'approved');

  if (error) throw error;

  const counts = (data || []).reduce(
    (acc: any, item: any) => {
      const districtName = item.districts?.name || 'Unknown';
      const existing = acc.find((d: any) => d.district === districtName);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ district: districtName, count: 1 });
      }
      return acc;
    },
    []
  );

  return counts;
}

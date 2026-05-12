// src/integrations/supabase/community-directory-api.ts

import { supabase } from './client';
import type {
  CommunityDirectoryListing,
  CommunityDirectoryInput,
  CommunityDirectorySearchFilters,
  CommunityDirectoryStats,
} from './community-directory-types';

// Create a new listing
export async function createCommunityDirectoryListing(
  data: CommunityDirectoryInput
): Promise<CommunityDirectoryListing> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: listing, error } = await supabase
    .from('community_directory')
    .insert({
      user_id: user.id,
      ...data,
      image_urls: data.image_urls || [],
      is_public: data.is_public !== undefined ? data.is_public : true,
      is_community_only: data.is_community_only !== undefined ? data.is_community_only : false,
      hide_address: data.hide_address || false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return listing;
}

// Get a listing by ID
export async function getCommunityDirectoryListing(
  id: string
): Promise<CommunityDirectoryListing> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Get user's listings
export async function getUserCommunityDirectoryListings(): Promise<
  CommunityDirectoryListing[]
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('community_directory')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Search and filter listings
export async function searchCommunityDirectoryListings(
  filters: CommunityDirectorySearchFilters
): Promise<{ listings: CommunityDirectoryListing[]; total: number }> {
  let query = supabase
    .from('community_directory')
    .select('*', { count: 'exact' })
    .eq('is_approved', true);

  // Always filter by is_public first for normal users
  query = query.eq('is_public', true);

  if (filters.district) {
    query = query.eq('district', filters.district);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.community_type) {
    query = query.eq('community_type', filters.community_type);
  }

  if (filters.function_type) {
    query = query.eq('function_type', filters.function_type);
  }

  if (filters.family_name) {
    query = query.ilike('family_name', `%${filters.family_name}%`);
  }

  if (filters.search) {
    // Use full-text search
    query = query.or(
      `full_name.ilike.%${filters.search}%,` +
        `family_name.ilike.%${filters.search}%,` +
        `profession.ilike.%${filters.search}%`
    );
  }

  // Pagination
  const limit = filters.limit || 12;
  const page = filters.page || 1;
  const start = (page - 1) * limit;

  query = query
    .order('created_at', { ascending: false })
    .range(start, start + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    listings: data || [],
    total: count || 0,
  };
}

// Get listings for specific district and city
export async function getCommunityDirectoryByLocation(
  district: string,
  city?: string
): Promise<CommunityDirectoryListing[]> {
  let query = supabase
    .from('community_directory')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .eq('district', district);

  if (city) {
    query = query.eq('city', city);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

// Get listings by community type
export async function getCommunityDirectoryByCommunity(
  communityType: string
): Promise<CommunityDirectoryListing[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .eq('community_type', communityType)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Get recent listings
export async function getRecentCommunityDirectoryListings(
  limit: number = 6
): Promise<CommunityDirectoryListing[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

// Update a listing
export async function updateCommunityDirectoryListing(
  id: string,
  updates: Partial<CommunityDirectoryInput>
): Promise<CommunityDirectoryListing> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the listing
  const { data: listing } = await supabase
    .from('community_directory')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!listing || listing.user_id !== user.id) {
    throw new Error('Unauthorized to update this listing');
  }

  const { data, error } = await supabase
    .from('community_directory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a listing
export async function deleteCommunityDirectoryListing(id: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the listing
  const { data: listing } = await supabase
    .from('community_directory')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!listing || listing.user_id !== user.id) {
    throw new Error('Unauthorized to delete this listing');
  }

  const { error } = await supabase
    .from('community_directory')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Admin: Get pending listings
export async function getAdminPendingListings(
  limit: number = 20
): Promise<CommunityDirectoryListing[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

// Admin: Approve a listing
export async function approveCommunityDirectoryListing(id: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('community_directory')
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Admin: Reject a listing
export async function rejectCommunityDirectoryListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('community_directory')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Get community directory statistics
export async function getCommunityDirectoryStats(): Promise<CommunityDirectoryStats> {
  const [approvedRes, pendingRes, totalRes, recentRes] = await Promise.all([
    supabase
      .from('community_directory')
      .select('id', { count: 'exact' })
      .eq('is_approved', true),
    supabase
      .from('community_directory')
      .select('id', { count: 'exact' })
      .eq('is_approved', false),
    supabase
      .from('community_directory')
      .select('id', { count: 'exact' }),
    supabase
      .from('community_directory')
      .select('id', { count: 'exact' })
      .eq('is_approved', true)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    total_listings: totalRes.count || 0,
    approved_listings: approvedRes.count || 0,
    pending_listings: pendingRes.count || 0,
    recent_listings: recentRes.count || 0,
  };
}

// Get available districts
export async function getAvailableDistricts(): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('district')
    .eq('is_approved', true)
    .eq('is_public', true)
    .order('district');

  if (error) {
    throw error;
  }

  // Get unique districts
  const districts = [...new Set((data || []).map((d) => d.district))];
  return districts.filter((d) => d);
}

// Get available cities for a district
export async function getAvailableCitiesInDistrict(district: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('city')
    .eq('is_approved', true)
    .eq('is_public', true)
    .eq('district', district)
    .order('city');

  if (error) {
    throw error;
  }

  // Get unique cities
  const cities = [...new Set((data || []).map((c) => c.city))];
  return cities.filter((c) => c);
}

// Get available communities
export async function getAvailableCommunities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_directory')
    .select('community_type')
    .eq('is_approved', true)
    .eq('is_public', true)
    .order('community_type');

  if (error) {
    throw error;
  }

  // Get unique communities
  const communities = [...new Set((data || []).map((c) => c.community_type))];
  return communities.filter((c) => c);
}

// Upload image to Supabase Storage
export async function uploadCommunityDirectoryImage(
  file: File
): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('community-directory')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('community-directory').getPublicUrl(filePath);

  return publicUrl;
}

// Delete image from storage
export async function deleteCommunityDirectoryImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/community-directory/')[1];
  if (!urlParts) {
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('community-directory')
    .remove([urlParts]);

  if (error) {
    throw error;
  }
}

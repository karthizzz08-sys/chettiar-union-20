// src/components/sangam/SangamSearch.tsx
import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SangamCard } from './SangamCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSangams,
  getDistricts,
  getCommunities,
} from '@/integrations/supabase/sangam-api';
import type { Sangam, District, Community } from '@/integrations/supabase/sangam-types';

interface SangamSearchProps {
  onSangamSelect?: (sangam: Sangam) => void;
  limit?: number;
}

export function SangamSearch({ onSangamSelect, limit }: SangamSearchProps) {
  const { t } = useLanguage();
  const [sangams, setSangams] = useState<Sangam[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');

  // Load districts and communities
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [d, c] = await Promise.all([getDistricts(), getCommunities()]);
        setDistricts(d);
        setCommunities(c);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  // Load sangams based on filters
  useEffect(() => {
    const loadSangams = async () => {
      setLoading(true);
      try {
        const results = await getSangams({
          district_id: selectedDistrict || undefined,
          community_id: selectedCommunity || undefined,
          search: searchText || undefined,
          limit: limit || 100,
        });
        setSangams(results);
      } catch (error) {
        console.error('Error loading sangams:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSangams();
  }, [searchText, selectedDistrict, selectedCommunity, limit]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder={t('sangam.search_placeholder')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger>
            <SelectValue placeholder={t('sangam.search_by_district')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.name_tamil})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger>
            <SelectValue placeholder={t('sangam.search_by_community')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Communities</SelectItem>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.name_tamil})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="ml-2">{t('sangam.loading')}</span>
        </div>
      ) : sangams.length > 0 ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Found {sangams.length} sangam(s)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sangams.map((sangam) => (
              <SangamCard
                key={sangam.id}
                sangam={sangam}
                onClick={() => onSangamSelect?.(sangam)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('sangam.no_results')}</p>
        </div>
      )}
    </div>
  );
}

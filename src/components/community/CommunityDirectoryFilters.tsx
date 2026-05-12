// src/components/community/CommunityDirectoryFilters.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import {
  getAvailableDistricts,
  getAvailableCitiesInDistrict,
  getAvailableCommunities,
} from '@/integrations/supabase/community-directory-api';
import type { FunctionType } from '@/integrations/supabase/community-directory-types';

interface CommunityDirectoryFiltersProps {
  onFiltersChange: (filters: any) => void;
  onSearch: (query: string) => void;
}

const FUNCTION_TYPES: FunctionType[] = [
  'Wedding',
  'Ear Piercing',
  'House Warming',
  'Temple Function',
  'Business',
  'Others',
];

export function CommunityDirectoryFilters({
  onFiltersChange,
  onSearch,
}: CommunityDirectoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [community, setCommunity] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [functionType, setFunctionType] = useState('');

  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [communities, setCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [d, c] = await Promise.all([
          getAvailableDistricts(),
          getAvailableCommunities(),
        ]);
        setDistricts(d);
        setCommunities(c);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load cities when district changes
  useEffect(() => {
    if (district) {
      const loadCities = async () => {
        try {
          const c = await getAvailableCitiesInDistrict(district);
          setCities(c);
          setCity(''); // Reset city when district changes
        } catch (error) {
          console.error('Error loading cities:', error);
        }
      };
      loadCities();
    } else {
      setCities([]);
    }
  }, [district]);

  // Trigger filter change
  useEffect(() => {
    onFiltersChange({
      district: district || undefined,
      city: city || undefined,
      community_type: community || undefined,
      family_name: familyName || undefined,
      function_type: (functionType as FunctionType) || undefined,
      search: searchQuery || undefined,
    });
  }, [district, city, community, familyName, functionType, searchQuery, onFiltersChange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDistrict('');
    setCity('');
    setCommunity('');
    setFamilyName('');
    setFunctionType('');
  };

  const hasActiveFilters =
    searchQuery || district || city || community || familyName || functionType;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, family, profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* District */}
          <Select value={district} onValueChange={setDistrict} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City */}
          <Select value={city} onValueChange={setCity} disabled={!district || loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Community */}
          <Select value={community} onValueChange={setCommunity} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select Community" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Family Name */}
          <Input
            placeholder="Search by Family Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />

          {/* Function Type */}
          <Select value={functionType} onValueChange={setFunctionType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Function Type" />
            </SelectTrigger>
            <SelectContent>
              {FUNCTION_TYPES.map((ft) => (
                <SelectItem key={ft} value={ft}>
                  {ft}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    </Card>
  );
}

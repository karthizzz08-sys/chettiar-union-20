// src/components/community/CommunityDirectoryGroupedByLocation.tsx

import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityDirectoryCard } from './CommunityDirectoryCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';

interface CommunityDirectoryGroupedByLocationProps {
  listings: CommunityDirectoryListing[];
}

interface GroupedListings {
  [district: string]: {
    [city: string]: CommunityDirectoryListing[];
  };
}

export function CommunityDirectoryGroupedByLocation({
  listings,
}: CommunityDirectoryGroupedByLocationProps) {
  const groupedListings = useMemo(() => {
    const grouped: GroupedListings = {};

    listings.forEach((listing) => {
      if (!grouped[listing.district]) {
        grouped[listing.district] = {};
      }
      if (!grouped[listing.district][listing.city]) {
        grouped[listing.district][listing.city] = [];
      }
      grouped[listing.district][listing.city].push(listing);
    });

    return grouped;
  }, [listings]);

  const districts = Object.keys(groupedListings).sort();

  if (districts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No listings found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {districts.map((district) => {
        const citiesInDistrict = groupedListings[district];
        const cities = Object.keys(citiesInDistrict).sort();
        const totalListings = cities.reduce(
          (sum, city) => sum + citiesInDistrict[city].length,
          0
        );

        return (
          <Collapsible key={district} defaultOpen={true} className="border rounded-lg">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-3 hover:bg-amber-50"
              >
                <div className="flex items-center gap-3 text-left">
                  <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-primary">{district}</div>
                    <div className="text-sm text-muted-foreground">
                      {totalListings} {totalListings === 1 ? 'listing' : 'listings'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 transition-transform" />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 pb-4 pt-2">
              <div className="space-y-4">
                {cities.map((city) => {
                  const listingsInCity = citiesInDistrict[city];

                  return (
                    <div key={city} className="ml-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        {city} ({listingsInCity.length})
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-2">
                        {listingsInCity.map((listing) => (
                          <Link
                            key={listing.id}
                            to={`/community-directory/${listing.id}`}
                            className="no-underline"
                          >
                            <CommunityDirectoryCard listing={listing} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

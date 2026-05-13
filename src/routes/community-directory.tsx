// src/routes/community-directory.tsx

import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Heart } from 'lucide-react';
import { CommunityDirectoryFilters } from '@/components/community/CommunityDirectoryFilters';
import { CommunityDirectoryGroupedByLocation } from '@/components/community/CommunityDirectoryGroupedByLocation';
import { CommunityDirectoryRegistrationModal } from '@/components/community/CommunityDirectoryRegistrationModal';
import { searchCommunityDirectoryListings } from '@/integrations/supabase/community-directory-api';
import type { CommunityDirectoryListing, CommunityDirectorySearchFilters } from '@/integrations/supabase/community-directory-types';

export const Route = createFileRoute('/community-directory')({
  component: CommunityDirectoryPage,
});

function CommunityDirectoryPage() {
  const [listings, setListings] = useState<CommunityDirectoryListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CommunityDirectorySearchFilters>({});
  const [page, setPage] = useState(1);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const handleSearch = useCallback(async (newFilters: CommunityDirectorySearchFilters) => {
    setFilters(newFilters);
    setPage(1);

    try {
      setLoading(true);
      const { listings: results, total: totalCount } = await searchCommunityDirectoryListings({
        ...newFilters,
        page: 1,
        limit: 50, // Increased for better grouped display
      });
      setListings(results);
      setTotal(totalCount);
    } catch (error) {
      console.error('Error searching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = useCallback(async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      const { listings: results } = await searchCommunityDirectoryListings({
        ...filters,
        page: nextPage,
        limit: 50,
      });
      setListings((prev) => [...prev, ...results]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more listings:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const handleRegistrationSuccess = () => {
    // Reload search results to show new submission
    handleSearch(filters);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
              Community Directory
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Find and connect with community members, families, and businesses across different cities and districts.
            </p>

            {/* Register Button */}
            <Button
              onClick={() => setIsRegistrationModalOpen(true)}
              className="bg-gradient-royal text-secondary hover:opacity-90 shadow-elegant"
            >
              <Heart className="w-5 h-5 mr-2" />
              Register Your Family
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <CommunityDirectoryFilters
              onFiltersChange={handleSearch}
              onSearch={handleSearch}
            />
          </div>

          {/* Loading State */}
          {loading && listings.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          )}

          {/* Empty State */}
          {!loading && listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No profiles found. Try adjusting your filters or be the first to register!</p>
              <Button
                onClick={() => setIsRegistrationModalOpen(true)}
                variant="outline"
              >
                Register Your Family
              </Button>
            </div>
          )}

          {/* Listings Grouped by Location */}
          {listings.length > 0 && (
            <div className="space-y-8">
              <div className="text-sm text-muted-foreground text-center mb-4">
                Showing {listings.length} of {total} profiles
              </div>

              <CommunityDirectoryGroupedByLocation listings={listings} />

              {/* Show More Button */}
              {listings.length < total && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${listings.length} of ${total})`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <CommunityDirectoryRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
}

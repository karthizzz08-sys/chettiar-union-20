// src/components/community/CommunityDirectoryHomepage.tsx

import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityDirectoryCard } from './CommunityDirectoryCard';
import { getRecentCommunityDirectoryListings, getCommunityDirectoryStats } from '@/integrations/supabase/community-directory-api';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';

export function CommunityDirectoryHomepage() {
  const [listings, setListings] = useState<CommunityDirectoryListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_listings: 0, approved_listings: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recentListings, directoryStats] = await Promise.all([
          getRecentCommunityDirectoryListings(6),
          getCommunityDirectoryStats(),
        ]);
        setListings(recentListings);
        setStats(directoryStats);
      } catch (error) {
        console.error('Error loading community directory data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
          Community Directory
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Connect with community members, families, and businesses across different cities and districts.
          Find wedding invitations, family functions, business references, and more.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{stats.approved_listings}</div>
            <div className="text-sm text-muted-foreground">Verified Members</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{stats.total_listings}</div>
            <div className="text-sm text-muted-foreground">Total Profiles</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">20+</div>
            <div className="text-sm text-muted-foreground">Districts</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Trusted</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/community-directory">
            <Button className="bg-gradient-royal text-secondary hover:opacity-90 shadow-elegant">
              Browse Directory
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/community-directory/register">
            <Button variant="outline" className="border-amber-200">
              Register Your Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/community-directory/${listing.id}`}
                className="no-underline"
              >
                <CommunityDirectoryCard listing={listing} />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to="/community-directory">
              <Button variant="outline" size="lg">
                View All Profiles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Be the first to register in the Community Directory!</p>
          <Link to="/community-directory/register">
            <Button className="bg-gradient-royal text-secondary">Register Now</Button>
          </Link>
        </div>
      )}
    </section>
  );
}

// src/routes/community-directory/$id/edit.tsx

import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CommunityDirectoryForm } from '@/components/community/CommunityDirectoryForm';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getCommunityDirectoryListing } from '@/integrations/supabase/community-directory-api';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/community-directory/$id/edit')({
  component: CommunityDirectoryEditPage,
});

function CommunityDirectoryEditPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<CommunityDirectoryListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const loadListing = async () => {
      try {
        const data = await getCommunityDirectoryListing(id);
        if (data.user_id !== user?.id) {
          setError('Unauthorized');
          return;
        }
        setListing(data);
      } catch (err) {
        console.error('Error loading listing:', err);
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-gray-600">Listing not found</p>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    router.navigate({ to: `/community-directory/${id}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link to={`/community-directory/${id}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
            Edit Your Community Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Update your community directory listing
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <CommunityDirectoryForm initialData={listing} onSuccess={handleSuccess} />
        </Card>
      </div>
    </div>
  );
}

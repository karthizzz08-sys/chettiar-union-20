// src/routes/community-directory/$id.tsx

import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommunityDirectoryDetails } from '@/components/community/CommunityDirectoryDetails';

export const Route = createFileRoute('/community-directory/$id')({
  component: CommunityDirectoryDetailsPage,
});

function CommunityDirectoryDetailsPage() {
  const { id } = Route.useParams();
  const router = useRouter();

  const handleEdit = () => {
    router.navigate({ to: `/community-directory/${'$id'}/edit`, params: { id } });
  };

  const handleDelete = () => {
    router.navigate({ to: '/community-directory' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Link to="/community-directory">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </Link>

        {/* Details */}
        <CommunityDirectoryDetails
          listingId={id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

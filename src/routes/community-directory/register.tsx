// src/routes/community-directory/register.tsx

import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { CommunityDirectoryForm } from '@/components/community/CommunityDirectoryForm';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Route = createFileRoute('/community-directory/register')({
  component: CommunityDirectoryRegisterPage,
});

function CommunityDirectoryRegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSuccess = () => {
    router.navigate({ to: '/community-directory' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
            Register Your Community Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help your community family find you easily. Share your family details, business information, or functions you organize.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your profile will be reviewed by an admin before it appears publicly. This helps maintain the quality and safety of our community directory.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card className="p-8">
          <CommunityDirectoryForm onSuccess={handleSuccess} />
        </Card>
      </div>
    </div>
  );
}

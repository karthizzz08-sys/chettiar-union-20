// src/routes/admin.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { AdminCommunityDirectory } from '@/components/community/AdminCommunityDirectory';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});

function AdminPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (!session?.user?.email?.endsWith('@chettiarconnect.com')) {
      toast.error('Unauthorized access');
      navigate({ to: '/' });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-8 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold">{t('admin.title')}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg p-6">
          <AdminCommunityDirectory adminOnly={true} />
        </div>
      </div>
    </div>
  );
}

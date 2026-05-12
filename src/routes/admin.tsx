// src/routes/admin.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  getAllSangamRegistrations,
  approveSangamRegistration,
  rejectSangamRegistration,
} from '@/integrations/supabase/sangam-api';
import type { SangamRegistration } from '@/integrations/supabase/sangam-types';

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});

function AdminPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [registrations, setRegistrations] = useState<SangamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!session?.user?.email?.endsWith('@chettiarconnect.com')) {
      toast.error('Unauthorized access');
      navigate({ to: '/' });
    }
  }, [session, navigate]);

  // Load registrations
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const pending = await getAllSangamRegistrations('pending');
        setRegistrations(pending);
      } catch (error) {
        console.error('Error loading registrations:', error);
        toast.error('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };
    loadRegistrations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveSangamRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      toast.success('Sangam approved successfully');
    } catch (error) {
      console.error('Error approving sangam:', error);
      toast.error('Failed to approve sangam');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSangamRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      toast.success('Sangam rejected');
    } catch (error) {
      console.error('Error rejecting sangam:', error);
      toast.error('Failed to reject sangam');
    }
  };

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
        <Tabs defaultValue="registrations">
          <TabsList>
            <TabsTrigger value="registrations">{t('admin.registrations')}</TabsTrigger>
            <TabsTrigger value="sangams">{t('admin.sangams')}</TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : registrations.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Sangam Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">City</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Contact Person
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{reg.sangam_name}</td>
                        <td className="px-4 py-3">{reg.city}</td>
                        <td className="px-4 py-3">{reg.contact_person}</td>
                        <td className="px-4 py-3 space-x-2">
                          <Button
                            onClick={() => handleApprove(reg.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t('admin.approve')}
                          </Button>
                          <Button
                            onClick={() => handleReject(reg.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-600"
                          >
                            {t('admin.reject')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending registrations
              </div>
            )}
          </TabsContent>

          {/* Sangams Tab */}
          <TabsContent value="sangams">
            <div className="text-center py-8 text-gray-500">
              Coming soon - Manage existing Sangams
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

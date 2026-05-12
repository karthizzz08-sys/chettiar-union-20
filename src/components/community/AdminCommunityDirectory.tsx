// src/components/community/AdminCommunityDirectory.tsx

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getAdminPendingListings,
  approveCommunityDirectoryListing,
  rejectCommunityDirectoryListing,
  searchCommunityDirectoryListings,
} from '@/integrations/supabase/community-directory-api';
import { CommunityDirectoryDetails } from './CommunityDirectoryDetails';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';

interface AdminCommunityDirectoryProps {
  adminOnly?: boolean;
}

export function AdminCommunityDirectory({
  adminOnly = true,
}: AdminCommunityDirectoryProps) {
  const [pendingListings, setPendingListings] = useState<CommunityDirectoryListing[]>([]);
  const [approvedListings, setApprovedListings] = useState<CommunityDirectoryListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedListing, setSelectedListing] = useState<CommunityDirectoryListing | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const [pending, approved] = await Promise.all([
        getAdminPendingListings(50),
        (async () => {
          const result = await searchCommunityDirectoryListings({
            page: 1,
            limit: 50,
          });
          return result.listings.filter((l) => l.is_approved);
        })(),
      ]);
      setPendingListings(pending);
      setApprovedListings(approved);
    } catch (error) {
      console.error('Error loading listings:', error);
      setActionError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedListing) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await approveCommunityDirectoryListing(selectedListing.id);
      setActionSuccess(true);

      // Remove from pending and add to approved
      setPendingListings((prev) =>
        prev.filter((l) => l.id !== selectedListing.id)
      );
      setApprovedListings((prev) => [selectedListing, ...prev]);

      setTimeout(() => {
        setIsDialogOpen(false);
        setSelectedListing(null);
        setActionSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error approving listing:', error);
      setActionError('Failed to approve listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await rejectCommunityDirectoryListing(selectedListing.id);
      setActionSuccess(true);

      // Remove from pending
      setPendingListings((prev) =>
        prev.filter((l) => l.id !== selectedListing.id)
      );

      setTimeout(() => {
        setIsDialogOpen(false);
        setSelectedListing(null);
        setActionSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error rejecting listing:', error);
      setActionError('Failed to reject listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (listing: CommunityDirectoryListing) => {
    setSelectedListing(listing);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Approval ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedListings.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : pendingListings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No pending listings to approve</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingListings.map((listing) => (
                <Card key={listing.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-primary">{listing.family_name}</h3>
                      <p className="text-sm text-gray-600">{listing.full_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge>{listing.community_type}</Badge>
                      {listing.function_type && (
                        <Badge variant="outline">{listing.function_type}</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>📍 {listing.city}, {listing.district}</p>
                      {listing.profession && <p>💼 {listing.profession}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleViewDetails(listing)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedListing(listing);
                          setIsDialogOpen(true);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedListing(listing);
                          setIsDialogOpen(true);
                        }}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : approvedListings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No approved listings yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedListings.map((listing) => (
                <Card key={listing.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-primary">{listing.family_name}</h3>
                      <p className="text-sm text-gray-600">{listing.full_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      <Badge>{listing.community_type}</Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>📍 {listing.city}, {listing.district}</p>
                      {listing.profession && <p>💼 {listing.profession}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleViewDetails(listing)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedListing?.family_name} - {selectedListing?.community_type}
            </DialogTitle>
            <DialogDescription>
              {selectedListing?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              {/* Error Message */}
              {actionError && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {actionError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {actionSuccess && (
                <Alert className="border-green-500 bg-green-50">
                  <AlertDescription className="text-green-600">
                    Action completed successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Details Preview */}
              {selectedListing.is_approved ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Community Type</p>
                    <p>{selectedListing.community_type}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Location</p>
                    <p>{selectedListing.city}, {selectedListing.district}</p>
                  </div>
                  {selectedListing.profession && (
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Profession</p>
                      <p>{selectedListing.profession}</p>
                    </div>
                  )}
                  {selectedListing.description && (
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Description</p>
                      <p className="whitespace-pre-wrap">{selectedListing.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <CommunityDirectoryDetails listingId={selectedListing.id} />
              )}
            </div>
          )}

          {/* Action Buttons (only for pending) */}
          {selectedListing && !selectedListing.is_approved && (
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                variant="destructive"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// src/components/community/CommunityDirectoryDetails.tsx

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Calendar, Share2, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getCommunityDirectoryListing, deleteCommunityDirectoryListing } from '@/integrations/supabase/community-directory-api';
import { useAuth } from '@/context/AuthContext';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';

interface CommunityDirectoryDetailsProps {
  listingId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isPreview?: boolean;
}

export function CommunityDirectoryDetails({
  listingId,
  onEdit,
  onDelete,
  isPreview = false,
}: CommunityDirectoryDetailsProps) {
  const { user } = useAuth();
  const [listing, setListing] = useState<CommunityDirectoryListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        const data = await getCommunityDirectoryListing(listingId);
        setListing(data);
        setError(null);
      } catch (err) {
        console.error('Error loading listing:', err);
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  const isOwner = user?.id === listing?.user_id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCommunityDirectoryListing(listingId);
      setIsDeleteDialogOpen(false);
      onDelete?.();
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${listing?.family_name} - Community Directory`,
        text: `Check out ${listing?.full_name}'s community profile!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleWhatsApp = () => {
    if (listing?.whatsapp) {
      window.open(`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleCall = () => {
    if (listing?.phone) {
      window.location.href = `tel:${listing.phone}`;
    }
  };

  const handleEmail = () => {
    if (listing?.email) {
      window.location.href = `mailto:${listing.email}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertDescription className="text-red-600">
          {error || 'Listing not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Photo Gallery */}
      {listing.image_urls && listing.image_urls.length > 0 && (
        <div className="overflow-hidden rounded-lg">
          {listing.image_urls.length === 1 ? (
            <img
              src={listing.image_urls[0]}
              alt={listing.family_name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {listing.image_urls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-96">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {listing.image_urls.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          )}
        </div>
      )}

      {/* Header Section */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {listing.family_name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{listing.full_name}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gradient-royal text-secondary">
                  {listing.community_type}
                </Badge>
                {listing.function_type && (
                  <Badge variant="outline">{listing.function_type}</Badge>
                )}
                {listing.gothram && (
                  <Badge variant="secondary">{listing.gothram}</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap justify-end">
              {isOwner && (
                <>
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Location Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Location</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {listing.city}, {listing.district}
              </p>
              {!listing.hide_address && (
                <p className="text-gray-600 mt-1">{listing.address}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-primary mb-4">Contact</h2>
        <div className="space-y-3">
          {listing.phone && (
            <Button
              onClick={handleCall}
              variant="outline"
              className="w-full justify-start"
            >
              <Phone className="w-5 h-5 mr-3 text-amber-600" />
              <span>{listing.phone}</span>
            </Button>
          )}

          {listing.whatsapp && (
            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full justify-start"
            >
              <MessageCircle className="w-5 h-5 mr-3 text-green-600" />
              <span>WhatsApp: {listing.whatsapp}</span>
            </Button>
          )}

          {listing.email && (
            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full justify-start"
            >
              <Mail className="w-5 h-5 mr-3 text-blue-600" />
              <span>{listing.email}</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Professional Details */}
      {listing.profession && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-primary mb-3">Profession</h2>
          <p className="text-gray-700">{listing.profession}</p>
        </Card>
      )}

      {/* Description */}
      {listing.description && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-primary mb-3">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Posted on {formatDate(listing.created_at)}</span>
          </div>
          {listing.updated_at !== listing.created_at && (
            <span className="text-xs">
              Updated on {formatDate(listing.updated_at)}
            </span>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Profile'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

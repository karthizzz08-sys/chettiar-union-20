// src/components/community/CommunityDirectoryCard.tsx

import { Phone, MessageCircle, MapPin, Briefcase, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { CommunityDirectoryListing } from '@/integrations/supabase/community-directory-types';

interface CommunityDirectoryCardProps {
  listing: CommunityDirectoryListing;
  onViewDetails?: () => void;
}

export function CommunityDirectoryCard({ listing, onViewDetails }: CommunityDirectoryCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const primaryImage = listing.image_urls?.[0];

  const handleWhatsApp = () => {
    if (listing.whatsapp) {
      window.open(`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleCall = () => {
    if (listing.phone) {
      window.location.href = `tel:${listing.phone}`;
    }
  };

  const handleEmail = () => {
    if (listing.email) {
      window.location.href = `mailto:${listing.email}`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-rose-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.family_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-amber-200" />
          </div>
        )}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Status Badge */}
        {listing.function_type && (
          <Badge className="absolute top-3 left-3 bg-gradient-royal text-secondary">
            {listing.function_type}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Family Name */}
        <h3 className="text-lg font-semibold text-primary mb-1">
          {listing.family_name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {listing.full_name}
        </p>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>
              {listing.city}, {listing.district}
            </span>
          </div>

          {listing.profession && (
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>{listing.profession}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline">{listing.community_type}</Badge>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto">
          <Button
            onClick={onViewDetails}
            className="w-full bg-gradient-royal text-secondary hover:opacity-90"
          >
            View Details
          </Button>

          <div className="flex gap-2">
            {listing.whatsapp && (
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
            {listing.phone && (
              <Button
                onClick={handleCall}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

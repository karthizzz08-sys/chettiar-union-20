// src/components/sangam/SangamCard.tsx
import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { Sangam } from '@/integrations/supabase/sangam-types';
import { Button } from '@/components/ui/button';

interface SangamCardProps {
  sangam: Sangam;
  onClick?: () => void;
}

export function SangamCard({ sangam, onClick }: SangamCardProps) {
  const { t } = useLanguage();

  const handleCall = (phone: string | undefined) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsApp = (whatsapp: string | undefined) => {
    if (whatsapp) {
      const message = `Hello, I'm interested in ${sangam.sangam_name}`;
      window.location.href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        message
      )}`;
    }
  };

  const handleMaps = (mapLink: string | undefined) => {
    if (mapLink) {
      window.open(mapLink, '_blank');
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer border border-amber-100"
    >
      {/* Image Section */}
      {sangam.image_url && (
        <div className="h-48 bg-gradient-to-br from-amber-400 to-red-600 relative overflow-hidden">
          <img
            src={sangam.image_url}
            alt={sangam.sangam_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {sangam.sangam_name}
          </h3>
          {sangam.community && (
            <p className="text-sm text-amber-700 font-medium">
              {sangam.community.name}
            </p>
          )}
        </div>

        {/* Location Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {sangam.district && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
              <span>{sangam.city}, {sangam.district.name}</span>
            </div>
          )}
          {sangam.office_timing && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <span>{sangam.office_timing}</span>
            </div>
          )}
          {sangam.contact_person && (
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <span>{sangam.contact_person}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {sangam.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {sangam.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {sangam.phone && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCall(sangam.phone);
              }}
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sangam_card.call_now')}</span>
            </Button>
          )}
          {sangam.whatsapp && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp(sangam.whatsapp);
              }}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sangam_card.whatsapp')}</span>
            </Button>
          )}
          {sangam.map_link && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleMaps(sangam.map_link);
              }}
              variant="outline"
              size="sm"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sangam_card.google_maps')}</span>
            </Button>
          )}
        </div>

        {/* More Details Link */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          variant="default"
          size="sm"
          className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
        >
          {t('sangam_card.read_more')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

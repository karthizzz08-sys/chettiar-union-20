// src/components/community/CommunityDirectoryRegistrationModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CommunityDirectoryGuestForm } from './CommunityDirectoryGuestForm';
import { X } from 'lucide-react';

interface CommunityDirectoryRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CommunityDirectoryRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: CommunityDirectoryRegistrationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle className="text-2xl text-primary">
            Register Your Family
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Fill in the details below to register your family in our Community Directory. Your submission will be reviewed by our admin team before appearing publicly.
          </DialogDescription>
        </DialogHeader>

        <div className="pb-6">
          <CommunityDirectoryGuestForm
            onSuccess={() => {
              onClose();
              onSuccess?.();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

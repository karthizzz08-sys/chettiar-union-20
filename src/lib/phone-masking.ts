// src/lib/phone-masking.ts

/**
 * Mask a phone number to show only the last 5 digits
 * Example: "9876543210" becomes "98765XXXXX"
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If less than 5 digits, mask all but first digit
  if (digits.length <= 5) {
    return digits.charAt(0) + 'X'.repeat(digits.length - 1);
  }
  
  // Show first 5 digits, mask the rest
  const visiblePart = digits.substring(0, 5);
  const maskedPart = 'X'.repeat(digits.length - 5);
  
  return visiblePart + maskedPart;
}

/**
 * Get the full unmasked phone number for authenticated users
 * or masked version for guests
 */
export function getDisplayPhoneNumber(phoneNumber: string, isAuthed: boolean = false): string {
  if (isAuthed) {
    return phoneNumber;
  }
  return maskPhoneNumber(phoneNumber);
}

/**
 * Check if a phone number should be visible (for contact purposes)
 */
export function shouldShowPhoneNumber(isUserContactingOwner: boolean, isOwner: boolean): boolean {
  // Show full phone if user is the owner or if they're viewing contact info
  return isOwner || isUserContactingOwner;
}

// src/components/community/CommunityDirectoryGuestForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createGuestCommunityDirectoryListing } from '@/integrations/supabase/community-directory-api';

const TAMIL_DISTRICTS = [
  'Chennai',
  'Chengalpattu',
  'Tiruvallur',
  'Ranipet',
  'Vellore',
  'Tiruppattur',
  'Krishnagiri',
  'Dharmapuri',
  'Erode',
  'Nilgiris',
  'Coimbatore',
  'Tiruppur',
  'Namakkal',
  'Salem',
  'Villupuram',
  'Cuddalore',
  'Kallakurichi',
  'Ariyalur',
  'Perambalur',
  'Thanjavur',
  'Tiruvarur',
  'Nagapattinam',
  'Mayiladuthurai',
  'Tiruvannamalai',
  'Kanchipuram',
  'Ranipettai',
  'Madurai',
  'Theni',
  'Dindigul',
  'Virudhunagar',
  'Ramanathapuram',
  'Tuticorin',
  'Tenkasi',
  'Nagercoil',
  'Kanyakumari',
];

const guestFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  family_name: z.string().min(2, 'Family name is required'),
  contact_person_name: z.string().min(2, 'Contact person name is required'),
  community_type: z.string().min(1, 'Community type is required'),
  gothram: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  profession: z.string().optional(),
  description: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface CommunityDirectoryGuestFormProps {
  onSuccess?: () => void;
}

export function CommunityDirectoryGuestForm({
  onSuccess,
}: CommunityDirectoryGuestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      full_name: '',
      family_name: '',
      contact_person_name: '',
      community_type: '',
      gothram: '',
      district: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      profession: '',
      description: '',
    },
  });

  const onSubmit = async (values: GuestFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload = {
        full_name: values.full_name,
        family_name: values.family_name,
        community_type: values.community_type,
        gothram: values.gothram || undefined,
        district: values.district,
        city: values.city,
        address: values.address,
        phone: values.phone,
        email: values.email,
        profession: values.profession || undefined,
        description: values.description || undefined,
        image_urls: [],
        is_public: true,
        is_community_only: false,
        hide_address: false,
      };

      await createGuestCommunityDirectoryListing(
        payload,
        values.email,
        values.phone
      );

      setSubmitSuccess(true);
      form.reset();

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Error submitting form. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {submitSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            ✓ Thank you! Your family details have been submitted successfully. Our admin team will review and approve your entry within 24 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {submitError && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Family Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="family_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chettiar, Iyer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of primary contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="community_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Type *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chettiar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gothram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gothram (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter gothram if applicable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="10-digit mobile number" 
                        type="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Will be shown partially masked (98765XXXXX) for privacy</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Location Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAMIL_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete address"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Additional Information</h3>
            
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business/Profession (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Doctor, Lawyer, Merchant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your family or business. Mention if you're looking for wedding connections, business partnerships, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-royal text-secondary hover:opacity-90 shadow-elegant min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Details'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields. Your submission will be reviewed by admin before appearing in the directory.
          </p>
        </form>
      </Form>
    </div>
  );
}

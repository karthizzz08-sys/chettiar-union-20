// src/components/community/CommunityDirectoryForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, Upload, X, Loader2, CheckCircle } from 'lucide-react';
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
import {
  createCommunityDirectoryListing,
  updateCommunityDirectoryListing,
  uploadCommunityDirectoryImage,
  deleteCommunityDirectoryImage,
} from '@/integrations/supabase/community-directory-api';
import type { CommunityDirectoryListing, FunctionType } from '@/integrations/supabase/community-directory-types';

const FUNCTION_TYPES: FunctionType[] = [
  'Wedding',
  'Ear Piercing',
  'House Warming',
  'Temple Function',
  'Business',
  'Others',
];

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

const communityFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  family_name: z.string().min(2, 'Family name is required'),
  community_type: z.string().min(1, 'Community type is required'),
  gothram: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Valid email is required'),
  profession: z.string().optional(),
  description: z.string().optional(),
  function_type: z.enum([
    'Wedding',
    'Ear Piercing',
    'House Warming',
    'Temple Function',
    'Business',
    'Others',
  ]).optional(),
  is_public: z.boolean().default(true),
  is_community_only: z.boolean().default(false),
  hide_address: z.boolean().default(false),
});

type CommunityFormValues = z.infer<typeof communityFormSchema>;

interface CommunityDirectoryFormProps {
  initialData?: CommunityDirectoryListing;
  onSuccess?: () => void;
}

export function CommunityDirectoryForm({
  initialData,
  onSuccess,
}: CommunityDirectoryFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.image_urls || []
  );
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communityFormSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      family_name: initialData?.family_name || '',
      community_type: initialData?.community_type || '',
      gothram: initialData?.gothram || '',
      district: initialData?.district || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      whatsapp: initialData?.whatsapp || '',
      email: initialData?.email || '',
      profession: initialData?.profession || '',
      description: initialData?.description || '',
      function_type: initialData?.function_type,
      is_public: initialData?.is_public ?? true,
      is_community_only: initialData?.is_community_only ?? false,
      hide_address: initialData?.hide_address ?? false,
    },
  });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || uploadedImages.length >= 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const url = await uploadCommunityDirectoryImage(file);
          setUploadedImages((prev) => [...prev, url]);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setSubmitError('Error uploading images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      await deleteCommunityDirectoryImage(imageUrl);
      setUploadedImages((prev) => prev.filter((url) => url !== imageUrl));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (values: CommunityFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload = {
        ...values,
        image_urls: uploadedImages,
      };

      if (initialData) {
        await updateCommunityDirectoryListing(initialData.id, payload);
      } else {
        await createCommunityDirectoryListing(payload);
      }

      setSubmitSuccess(true);
      form.reset();
      setUploadedImages([]);

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
            {initialData
              ? 'Profile updated successfully!'
              : 'Profile registered successfully! Awaiting admin approval.'}
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
            <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="family_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter family name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="community_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chettiar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>District</FormLabel>
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
                    <FormLabel>City</FormLabel>
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
                  <FormLabel>Full Address</FormLabel>
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

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="10-digit phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Include country code (e.g., +91)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Professional Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Professional Details</h3>
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Business Owner, Farmer, Doctor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Function Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Function Details</h3>
            <FormField
              control={form.control}
              name="function_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select function type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUNCTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell about your family, business, or functions you organize..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps other community members understand more about you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Photos Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Photos</h3>
            <div className="border-2 border-dashed border-amber-200 rounded-lg p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-10 h-10 text-amber-600 mb-2" />
                <span className="text-sm font-medium text-amber-600">
                  Click to upload photos
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB each (Max 5 photos)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploadingImages || uploadedImages.length >= 5}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Uploaded Photos ({uploadedImages.length}/5)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((url) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt="Uploaded"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadingImages && (
              <div className="flex items-center gap-2 text-amber-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading photos...</span>
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Privacy Settings</h3>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Make my profile visible to all community members
                      </FormLabel>
                      <FormDescription>
                        Your profile will be visible in public search results
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_community_only"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Only visible to same community members
                      </FormLabel>
                      <FormDescription>
                        Only people from your community can see this profile
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hide_address"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Hide my address from public view
                      </FormLabel>
                      <FormDescription>
                        Your exact address will not be shown publicly
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-royal text-secondary hover:opacity-90"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {initialData ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              initialData ? 'Update Profile' : 'Register Profile'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

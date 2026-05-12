// src/components/sangam/RegisterSangamForm.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  registerSangam,
  getDistricts,
  getCommunities,
} from '@/integrations/supabase/sangam-api';
import type { District, Community } from '@/integrations/supabase/sangam-types';

interface RegisterSangamFormProps {
  onSuccess?: () => void;
}

export function RegisterSangamForm({ onSuccess }: RegisterSangamFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  const [formData, setFormData] = useState({
    sangam_name: '',
    community_id: '',
    district_id: '',
    city: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    description: '',
    office_timing: '',
    contact_person: '',
  });

  // Load districts and communities
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [d, c] = await Promise.all([getDistricts(), getCommunities()]);
        setDistricts(d);
        setCommunities(c);
      } catch (error) {
        console.error('Error loading options:', error);
        toast.error('Failed to load form options');
      }
    };
    loadOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.sangam_name.trim()) {
      toast.error(t('register_form.required'));
      return false;
    }
    if (!formData.community_id) {
      toast.error(t('register_form.required'));
      return false;
    }
    if (!formData.district_id) {
      toast.error(t('register_form.required'));
      return false;
    }
    if (!formData.city.trim()) {
      toast.error(t('register_form.required'));
      return false;
    }
    if (!formData.address.trim()) {
      toast.error(t('register_form.required'));
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      toast.error(t('register_form.invalid_email'));
      return false;
    }
    if (formData.phone && formData.phone.length < 10) {
      toast.error(t('register_form.invalid_phone'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await registerSangam({
        sangam_name: formData.sangam_name,
        community_id: formData.community_id,
        district_id: formData.district_id,
        city: formData.city,
        address: formData.address,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        description: formData.description || undefined,
        office_timing: formData.office_timing || undefined,
        contact_person: formData.contact_person || undefined,
      });

      toast.success(t('register_form.success'));
      setFormData({
        sangam_name: '',
        community_id: '',
        district_id: '',
        city: '',
        address: '',
        phone: '',
        whatsapp: '',
        email: '',
        description: '',
        office_timing: '',
        contact_person: '',
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error registering sangam:', error);
      toast.error(t('register_form.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">
          {t('register_form.title')}
        </h3>
        <p className="text-sm text-amber-800">{t('register_form.form_description')}</p>
      </div>

      {/* Sangam Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.sangam_name')} *
        </label>
        <Input
          type="text"
          name="sangam_name"
          value={formData.sangam_name}
          onChange={handleChange}
          placeholder="e.g., Thanjavur Chettiar Sangam"
          required
        />
      </div>

      {/* Community */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.community')} *
        </label>
        <Select
          value={formData.community_id}
          onValueChange={(value) => handleSelectChange('community_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('register_form.community')} />
          </SelectTrigger>
          <SelectContent>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.name_tamil})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.district')} *
        </label>
        <Select
          value={formData.district_id}
          onValueChange={(value) => handleSelectChange('district_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('register_form.district')} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.name_tamil})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.city')} *
        </label>
        <Input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="e.g., Thanjavur"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.address')} *
        </label>
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full address"
          required
        />
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('register_form.phone')}
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('register_form.whatsapp')}
          </label>
          <Input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.email')}
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contact@sangam.com"
        />
      </div>

      {/* Contact Person */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.contact_person')}
        </label>
        <Input
          type="text"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
          placeholder="e.g., Mr. Ramakrishnan"
        />
      </div>

      {/* Office Timing */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.office_timing')}
        </label>
        <Input
          type="text"
          name="office_timing"
          value={formData.office_timing}
          onChange={handleChange}
          placeholder="e.g., 9:00 AM - 6:00 PM"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('register_form.description')}
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description about your Sangam"
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
      >
        {loading ? 'Submitting...' : t('register_form.submit')}
      </Button>
    </form>
  );
}

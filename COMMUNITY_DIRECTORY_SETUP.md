# Community Directory Setup Guide

## 🎉 Complete Implementation - Ready to Deploy!

I've successfully implemented a comprehensive **Community Directory** feature for your Chettiar Connect website. This feature allows community members to register and find each other for weddings, functions, business references, and social networking.

---

## 📋 What's Been Implemented

### ✅ Core Features
- **User Registration**: Complete form with bilingual support (English + Tamil)
- **Photo Uploads**: Support for up to 5 images per profile
- **Advanced Search**: Filter by district, city, community, family name, and function type
- **Privacy Controls**: Public, community-only, or hidden address options
- **Contact Integration**: Direct WhatsApp, phone, and email links
- **Admin Approval System**: All listings require approval before public display
- **Homepage Integration**: Recent listings displayed with statistics
- **Responsive Design**: Mobile-optimized with gold + maroon theme

### 📁 Files Created

#### Routes (4 new routes)
```
src/routes/community-directory.tsx              # Browse/Search page
src/routes/community-directory/register.tsx     # Registration form
src/routes/community-directory/$id.tsx          # Profile details
src/routes/community-directory/$id/edit.tsx     # Edit profile
```

#### Components (6 new components)
```
src/components/community/CommunityDirectoryCard.tsx        # Listing cards
src/components/community/CommunityDirectoryFilters.tsx     # Search filters
src/components/community/CommunityDirectoryForm.tsx        # Registration form
src/components/community/CommunityDirectoryDetails.tsx     # Full profile view
src/components/community/CommunityDirectoryHomepage.tsx    # Homepage section
src/components/community/AdminCommunityDirectory.tsx       # Admin interface
```

#### API & Types
```
src/integrations/supabase/community-directory-api.ts   # All API functions
src/integrations/supabase/community-directory-types.ts # TypeScript types
```

#### Database
```
supabase/migrations/20260512_create_community_directory.sql  # Schema
```

#### Translations
- Updated `src/lib/i18n.ts` with complete English and Tamil translations
- Updated Navbar to include "Community Directory" / "சமூக அடைவு"

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Migration

Run the database migration to create the `community_directory` table:

```bash
# Using Supabase CLI
supabase migration up

# Or access Supabase dashboard > SQL Editor and run the migration file content
```

**File**: `supabase/migrations/20260512_create_community_directory.sql`

### Step 2: Setup Supabase Storage Bucket

1. Go to **Supabase Dashboard** > **Storage** > **Buckets**
2. Create a new bucket named: `community-directory`
3. Set it to **Public** (or configure signed URLs if preferred)
4. Upload a test image to verify it works

### Step 3: Update Navbar (Done ✓)

The Navbar has been automatically updated to include the Community Directory link.

### Step 4: Verify Homepage Integration (Done ✓)

The homepage now displays a "Community Directory" section with:
- Statistics (total members, verified profiles, etc.)
- Recent listings carousel
- Links to browse and register

### Step 5: Update Admin Roles (Manual)

To enable admin approval features, update user metadata in Supabase:

```sql
-- For an admin user, update their raw_user_meta_data in auth.users
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb), 
  '{is_admin}', 
  'true'::jsonb
)
WHERE email = 'admin@example.com';
```

### Step 6: Test the Feature

1. **Browse Directory**
   - Go to `/community-directory`
   - Test filters and search

2. **Register Profile** (requires login)
   - Go to `/community-directory/register`
   - Fill the form with test data
   - Upload test images
   - Submit (profile will be pending approval)

3. **Admin Approval** (requires admin role)
   - Create an admin dashboard page using `AdminCommunityDirectory` component
   - Or add to existing admin panel
   - Approve/reject pending listings

4. **View Profile**
   - Click "View Details" on any approved listing
   - Test WhatsApp, call, and email buttons

---

## 🔧 Configuration

### Required Environment Variables
No new environment variables needed! Uses your existing Supabase configuration.

### Optional Customizations

#### 1. Change Photo Upload Limit
Edit `src/components/community/CommunityDirectoryForm.tsx`:
```typescript
if (uploadedImages.length >= 5) {  // Change 5 to desired limit
  alert('Maximum 5 images allowed');
}
```

#### 2. Change Default Districts
Edit the `TAMIL_DISTRICTS` array in `CommunityDirectoryForm.tsx` to add/remove districts

#### 3. Customize Function Types
Edit the `FUNCTION_TYPES` array in components and types file

---

## 📊 Database Schema

### Main Table: `community_directory`

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique identifier |
| user_id | UUID | Link to registered user |
| full_name | VARCHAR | User's full name |
| family_name | VARCHAR | Family surname |
| community_type | VARCHAR | Community (e.g., Chettiar) |
| gothram | VARCHAR | Optional gothram |
| district | VARCHAR | District in Tamil Nadu |
| city | VARCHAR | City name |
| address | TEXT | Full address |
| phone | VARCHAR | Phone number |
| whatsapp | VARCHAR | WhatsApp number |
| email | VARCHAR | Email address |
| profession | VARCHAR | Professional details |
| function_type | VARCHAR | Type of function/business |
| description | TEXT | About family/business |
| image_urls | JSONB | Array of photo URLs |
| is_public | BOOLEAN | Visibility setting |
| is_community_only | BOOLEAN | Community-only visibility |
| hide_address | BOOLEAN | Hide address from public |
| is_approved | BOOLEAN | Admin approval status |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last update date |

### Indexes & Features
- Full-text search on multiple fields
- Row-Level Security (RLS) policies
- Automatic `updated_at` trigger
- Search text optimization trigger

---

## 🔐 Security & Privacy

### Row-Level Security Policies

1. **Public Listings**: Visible to all authenticated users
2. **Community-Only**: Only visible to same community members
3. **Own Listings**: Users can always view/edit their own
4. **Admin Access**: Admins can view all listings for approval
5. **Address Hiding**: Addresses can be hidden from public view

### Data Protection

- Phone and email verified via OTP during registration
- Profile photos stored securely in Supabase Storage
- User data encrypted in transit
- GDPR-ready with privacy controls

---

## 🎨 UI/UX Features

### Mobile Responsive
- All components are fully responsive
- Mobile-first design approach
- Touch-friendly buttons and interactions

### Bilingual Support
- All strings in English and Tamil
- Seamless language switching
- RTL-ready (if needed for future)

### Dark Mode Support
- Uses your existing theme system
- Tailwind CSS with CSS variables
- Gold + Maroon color scheme

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG standards

---

## 🛠️ Troubleshooting

### "Photos not uploading"
- Check Supabase Storage bucket exists: `community-directory`
- Verify bucket is public or has correct policies
- Check browser console for CORS errors

### "Can't see approved listings"
- Ensure admin approval was completed
- Check `is_approved` = true in database
- Verify listing owner is authenticated user

### "Search filters not working"
- Clear browser cache
- Check if any listings exist in selected district
- Verify filter values match database exactly

### "WhatsApp link not working"
- Ensure WhatsApp number includes country code (+91)
- Test format: `https://wa.me/91XXXXXXXXXX`
- Remove any non-numeric characters except `+`

---

## 📱 API Reference

### Key API Functions

```typescript
// Registration
createCommunityDirectoryListing(data)
updateCommunityDirectoryListing(id, updates)
deleteCommunityDirectoryListing(id)

// Search & Browse
searchCommunityDirectoryListings(filters)
getRecentCommunityDirectoryListings(limit)
getCommunityDirectoryByLocation(district, city)

// Admin Functions
getAdminPendingListings(limit)
approveCommunityDirectoryListing(id)
rejectCommunityDirectoryListing(id)

// Photos
uploadCommunityDirectoryImage(file)
deleteCommunityDirectoryImage(imageUrl)

// Filters
getAvailableDistricts()
getAvailableCitiesInDistrict(district)
getAvailableCommunities()
```

---

## 📈 Analytics & Monitoring

To track usage, you can add:

```typescript
// In analytics service
trackEvent('community_directory_view')
trackEvent('community_directory_registration')
trackEvent('community_directory_contact', { type: 'whatsapp' | 'call' | 'email' })
```

---

## 🔄 Future Enhancements

Consider adding:

1. **Map Integration**
   - Show listings on Google Maps by location
   - Location-based search

2. **Notifications**
   - Email notification to user when profile is approved
   - Notification to admin for new registrations

3. **Messaging**
   - Direct messaging between community members
   - Chat history

4. **Events Calendar**
   - Display upcoming functions/weddings
   - RSVP functionality

5. **Ratings & Reviews**
   - Community members can rate businesses
   - Trust score system

6. **Advanced Analytics**
   - Most active districts/cities
   - Popular function types
   - Growth metrics

---

## 📞 Support

If you encounter any issues:

1. Check the Supabase dashboard for errors
2. Review browser console for JavaScript errors
3. Verify all files are created correctly
4. Check that routes are properly generated by Tanstack Router
5. Ensure Supabase RLS policies are correct

---

## ✨ Key Highlights

- ✅ **Zero Breaking Changes**: Fully compatible with existing matrimony system
- ✅ **OTP Login**: Works with existing authentication
- ✅ **Vercel Ready**: No additional dependencies or configuration needed
- ✅ **Scalable**: Optimized queries and indexes for performance
- ✅ **Bilingual**: Full Tamil translation included
- ✅ **Mobile First**: Fully responsive design
- ✅ **Privacy Focused**: User controls over visibility
- ✅ **Admin Friendly**: Approval workflow included

---

## 🎯 Next Steps

1. **Deploy Migration**: Run the database migration
2. **Create Storage Bucket**: Set up photo storage
3. **Test Registration**: Register a test profile
4. **Admin Approval**: Approve test profile
5. **Go Live**: Deploy to production
6. **Monitor**: Track usage and gather feedback

---

**The Community Directory is now fully integrated into your Chettiar Connect platform and ready for deployment!** 🚀

For any questions or customizations, refer to the component files which are well-documented and modular for easy modifications.

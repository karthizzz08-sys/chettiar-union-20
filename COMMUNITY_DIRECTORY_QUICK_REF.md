# Community Directory - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# 1. Apply database migration
supabase migration up

# 2. Create storage bucket
# Go to: Supabase Dashboard → Storage → Create Bucket "community-directory"

# 3. Test the feature
# Visit: http://localhost:5173/community-directory

# 4. Register a test profile
# Visit: http://localhost:5173/community-directory/register

# 5. View in admin panel
# Visit: http://localhost:5173/admin → Community Directory tab
```

---

## 📂 File Quick Map

| Need | File | Location |
|------|------|----------|
| Browse Profiles | `community-directory.tsx` | `src/routes/` |
| Register Profile | `register.tsx` | `src/routes/community-directory/` |
| View Profile | `$id.tsx` | `src/routes/community-directory/` |
| Edit Profile | `edit.tsx` | `src/routes/community-directory/$id/` |
| Listing Card | `CommunityDirectoryCard.tsx` | `src/components/community/` |
| Search Filters | `CommunityDirectoryFilters.tsx` | `src/components/community/` |
| Registration Form | `CommunityDirectoryForm.tsx` | `src/components/community/` |
| Profile Details | `CommunityDirectoryDetails.tsx` | `src/components/community/` |
| Homepage Section | `CommunityDirectoryHomepage.tsx` | `src/components/community/` |
| Admin Dashboard | `AdminCommunityDirectory.tsx` | `src/components/community/` |
| API Functions | `community-directory-api.ts` | `src/integrations/supabase/` |
| Types | `community-directory-types.ts` | `src/integrations/supabase/` |
| Database Schema | `20260512_create_community_directory.sql` | `supabase/migrations/` |

---

## 🔗 URL Routes

| Route | Purpose |
|-------|---------|
| `/community-directory` | Browse/search all profiles |
| `/community-directory/register` | Register new profile |
| `/community-directory/:id` | View profile details |
| `/community-directory/:id/edit` | Edit own profile |
| `/admin` → Community Directory tab | Admin approve/reject |

---

## 💻 Import Statements

```typescript
// API Functions
import {
  createCommunityDirectoryListing,
  searchCommunityDirectoryListings,
  getRecentCommunityDirectoryListings,
  uploadCommunityDirectoryImage,
  deleteCommunityDirectoryImage,
  approveCommunityDirectoryListing,
  rejectCommunityDirectoryListing,
  // ... more functions
} from '@/integrations/supabase/community-directory-api';

// Types
import type {
  CommunityDirectoryListing,
  CommunityDirectoryInput,
  CommunityDirectorySearchFilters,
  FunctionType,
} from '@/integrations/supabase/community-directory-types';

// Components
import { CommunityDirectoryCard } from '@/components/community/CommunityDirectoryCard';
import { CommunityDirectoryFilters } from '@/components/community/CommunityDirectoryFilters';
import { CommunityDirectoryForm } from '@/components/community/CommunityDirectoryForm';
import { CommunityDirectoryDetails } from '@/components/community/CommunityDirectoryDetails';
import { CommunityDirectoryHomepage } from '@/components/community/CommunityDirectoryHomepage';
import { AdminCommunityDirectory } from '@/components/community/AdminCommunityDirectory';
```

---

## 🎨 Component Props

### CommunityDirectoryCard
```typescript
<CommunityDirectoryCard
  listing={listing}
  onViewDetails={() => navigate(...)}
/>
```

### CommunityDirectoryFilters
```typescript
<CommunityDirectoryFilters
  onFiltersChange={(filters) => handleSearch(filters)}
  onSearch={(query) => handleSearch({ search: query })}
/>
```

### CommunityDirectoryForm
```typescript
<CommunityDirectoryForm
  initialData={listing}  // optional - for edit mode
  onSuccess={() => navigate(...)}
/>
```

### CommunityDirectoryDetails
```typescript
<CommunityDirectoryDetails
  listingId={id}
  onEdit={() => handleEdit()}
  onDelete={() => handleDelete()}
  isPreview={false}
/>
```

### CommunityDirectoryHomepage
```typescript
<CommunityDirectoryHomepage />
```

### AdminCommunityDirectory
```typescript
<AdminCommunityDirectory adminOnly={true} />
```

---

## 🔑 Key API Functions

### Create Listing
```typescript
const listing = await createCommunityDirectoryListing({
  full_name: string,
  family_name: string,
  community_type: string,
  district: string,
  city: string,
  address: string,
  phone: string,
  email: string,
  // ... optional fields
});
```

### Search Listings
```typescript
const { listings, total } = await searchCommunityDirectoryListings({
  district: 'Chennai',
  city: 'Chennai',
  community_type: 'Chettiar',
  page: 1,
  limit: 12,
});
```

### Upload Photo
```typescript
const url = await uploadCommunityDirectoryImage(file);
setPhotos([...photos, url]);
```

### Admin Approve
```typescript
await approveCommunityDirectoryListing(listingId);
```

### Admin Reject
```typescript
await rejectCommunityDirectoryListing(listingId);
```

---

## 🗄️ Database Tables

### community_directory (Main Table)
- 22 columns
- 8 indexes for performance
- 7 RLS policies for security
- 2 triggers for automation

### Views
- `community_directory_public` - for public listings

---

## 🔐 RLS Policies

| Policy | Allows |
|--------|--------|
| view_approved_public_listings | Anyone to view public approved |
| view_own_listings | Users to view their own |
| insert_own_listings | Users to create new |
| update_own_listings | Users to update own |
| delete_own_listings | Users to delete own |
| admin_view_all_listings | Admins to view all |
| admin_approve_listings | Admins to approve |

---

## 🛠️ Common Tasks

### Display Search Results
```typescript
const [listings, setListings] = useState([]);

const handleSearch = async (filters) => {
  const { listings } = await searchCommunityDirectoryListings({
    ...filters,
    page: 1,
    limit: 12,
  });
  setListings(listings);
};
```

### Register New Profile
```typescript
const handleSubmit = async (data) => {
  try {
    const listing = await createCommunityDirectoryListing(data);
    toast.success('Profile registered! Awaiting approval.');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Upload Profile Photos
```typescript
const handlePhotoUpload = async (files) => {
  for (const file of files) {
    const url = await uploadCommunityDirectoryImage(file);
    setPhotos(prev => [...prev, url]);
  }
};
```

### Admin Approve Profile
```typescript
const handleApprove = async (listingId) => {
  await approveCommunityDirectoryListing(listingId);
  toast.success('Profile approved!');
};
```

---

## 📊 TypeScript Types

### Main Types
```typescript
type FunctionType = 
  | 'Wedding'
  | 'Ear Piercing'
  | 'House Warming'
  | 'Temple Function'
  | 'Business'
  | 'Others';

interface CommunityDirectoryListing {
  id: string;
  user_id: string;
  full_name: string;
  family_name: string;
  community_type: string;
  gothram?: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  profession?: string;
  function_type?: FunctionType;
  image_urls: string[];
  is_public: boolean;
  is_community_only: boolean;
  hide_address: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 🌐 Translation Keys

### Search Page
```typescript
t('community_directory.title')
t('community_directory.subtitle')
t('community_directory.search_by_district')
t('community_directory.view_all')
```

### Form
```typescript
t('community_form.title')
t('community_form.full_name')
t('community_form.family_name')
t('community_form.submit')
```

### Admin
```typescript
t('admin_community.title')
t('admin_community.pending_approvals')
t('admin_community.approve_profile')
```

---

## ✅ Testing Checklist

```
Profile Registration:
☐ Submit with all required fields
☐ Upload single photo
☐ Upload multiple photos
☐ Test form validation
☐ Verify pending status

Search:
☐ Filter by district
☐ Filter by city
☐ Filter by community
☐ Filter by function type
☐ Test pagination

Contact:
☐ WhatsApp link works
☐ Phone link works
☐ Email link works

Admin:
☐ Can view pending
☐ Can approve
☐ Can reject
☐ Can view approved

Mobile:
☐ Responsive layout
☐ Touch buttons work
☐ Form inputs accessible
```

---

## 🚨 Error Messages

| Error | Check |
|-------|-------|
| "User not authenticated" | Login required before API call |
| "Unauthorized to update" | Only owner can edit |
| "Photo upload failed" | Storage bucket exists and is public |
| "RLS policy violation" | User has correct permissions |
| "Phone format invalid" | Regex validation for phone |
| "Community-only view denied" | Same community restriction |

---

## 📊 Performance Tips

1. **Use pagination** - Don't load all 1000 listings at once
2. **Cache filter options** - Don't reload districts every render
3. **Lazy load images** - Use image lazy loading
4. **Debounce search** - Avoid too many API calls
5. **Optimize re-renders** - Use `useCallback` for handlers

---

## 🔄 Workflow Diagrams

### User Registration Flow
```
1. User logs in
   ↓
2. Go to /community-directory/register
   ↓
3. Fill form + upload photos
   ↓
4. Submit profile
   ↓
5. Profile status: PENDING
   ↓
6. Admin approves
   ↓
7. Profile status: APPROVED
   ↓
8. Visible in search results
```

### Search Flow
```
1. User browses /community-directory
   ↓
2. Select filters
   ↓
3. Results update in real-time
   ↓
4. Click "View Details"
   ↓
5. See full profile
   ↓
6. Click contact button
   ↓
7. Contact via WhatsApp/Phone/Email
```

---

## 📞 Support Resources

- Setup Guide: See `COMMUNITY_DIRECTORY_SETUP.md`
- Dev Guide: See `COMMUNITY_DIRECTORY_DEV_GUIDE.md`
- Summary: See `COMMUNITY_DIRECTORY_SUMMARY.md`

---

**Quick Reference Card v1.0 - Community Directory Feature**  
*Last Updated: May 12, 2026*

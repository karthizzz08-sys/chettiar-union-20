# Community Directory Developer Reference

## Quick Start for Developers

### Understanding the Feature Architecture

The Community Directory is structured in modular layers:

```
Routes (User Interface)
    ↓
Components (Reusable UI)
    ↓
API Functions (Business Logic)
    ↓
Database (Supabase)
```

---

## File Structure Overview

### 1. Routes Layer

#### `/community-directory`
- **Path**: `src/routes/community-directory.tsx`
- **Purpose**: Main search and browse page
- **Features**: 
  - Search filters (district, city, community, family name, function type)
  - Pagination with "Load More"
  - Responsive grid layout
  - Infinite scroll support

#### `/community-directory/register`
- **Path**: `src/routes/community-directory/register.tsx`
- **Purpose**: Registration page for new profiles
- **Auth**: Requires logged-in user
- **Features**:
  - Redirects to login if not authenticated
  - Form submission with success/error handling

#### `/community-directory/$id`
- **Path**: `src/routes/community-directory/$id.tsx`
- **Purpose**: View profile details
- **Features**:
  - Photo gallery with carousel
  - Contact buttons (WhatsApp, call, email)
  - Share profile functionality
  - Edit/delete options for profile owner

#### `/community-directory/$id/edit`
- **Path**: `src/routes/community-directory/$id/edit.tsx`
- **Purpose**: Edit existing profile
- **Auth**: Only profile owner can edit
- **Features**:
  - Pre-filled form with existing data
  - Photo management (add/remove)
  - Same validation as registration

---

### 2. Components Layer

#### CommunityDirectoryCard.tsx
```typescript
// Props
interface CommunityDirectoryCardProps {
  listing: CommunityDirectoryListing;
  onViewDetails?: () => void;
}

// Usage
<CommunityDirectoryCard
  listing={listing}
  onViewDetails={() => navigate(`/community-directory/${listing.id}`)}
/>
```

**Features**:
- Responsive card layout
- Photo display with fallback
- Quick action buttons (View Details, WhatsApp, Call)
- Favorite/like button
- Badge for function type

#### CommunityDirectoryFilters.tsx
```typescript
// Props
interface CommunityDirectoryFiltersProps {
  onFiltersChange: (filters: any) => void;
  onSearch: (query: string) => void;
}

// Usage
<CommunityDirectoryFilters
  onFiltersChange={(filters) => handleSearch(filters)}
  onSearch={(query) => handleSearch({ search: query })}
/>
```

**Features**:
- Multi-select dropdowns
- Text search
- Clear all filters button
- Dynamic city loading based on district selection
- Async data loading for filter options

#### CommunityDirectoryForm.tsx
```typescript
// Props
interface CommunityDirectoryFormProps {
  initialData?: CommunityDirectoryListing;
  onSuccess?: () => void;
}

// Usage
<CommunityDirectoryForm
  initialData={listing}  // For edit mode
  onSuccess={() => navigate('/community-directory')}
/>
```

**Features**:
- Zod schema validation
- React Hook Form integration
- Photo upload with preview
- Organized sections (Personal, Location, Contact, etc.)
- Privacy controls
- Success/error notifications

#### CommunityDirectoryDetails.tsx
```typescript
// Props
interface CommunityDirectoryDetailsProps {
  listingId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isPreview?: boolean;
}

// Usage
<CommunityDirectoryDetails
  listingId={listing.id}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isPreview={false}
/>
```

**Features**:
- Photo carousel
- Full contact details
- Address display (can be hidden)
- Edit/delete for owner
- Share functionality
- Loading and error states

#### CommunityDirectoryHomepage.tsx
- Displays recent listings on homepage
- Statistics section
- Call-to-action buttons
- Responsive layout

#### AdminCommunityDirectory.tsx
```typescript
// Props
interface AdminCommunityDirectoryProps {
  adminOnly?: boolean;
}

// Usage
<AdminCommunityDirectory adminOnly={true} />
```

**Features**:
- Tabbed interface (Pending/Approved)
- Approve/Reject functionality
- View full profile details
- Batch management support
- Delete capabilities

---

### 3. API Layer

**File**: `src/integrations/supabase/community-directory-api.ts`

#### CRUD Operations

```typescript
// Create
const listing = await createCommunityDirectoryListing({
  full_name: string,
  family_name: string,
  // ... other fields
});

// Read
const listing = await getCommunityDirectoryListing(id);
const userListings = await getUserCommunityDirectoryListings();

// Update
await updateCommunityDirectoryListing(id, {
  /* partial updates */
});

// Delete
await deleteCommunityDirectoryListing(id);
```

#### Search Operations

```typescript
const { listings, total } = await searchCommunityDirectoryListings({
  district: 'Chennai',
  city: 'Chennai',
  community_type: 'Chettiar',
  family_name: 'Some Family',
  function_type: 'Wedding',
  search: 'query text',
  page: 1,
  limit: 12,
});
```

#### Admin Operations

```typescript
// Get pending
const pending = await getAdminPendingListings(20);

// Approve
await approveCommunityDirectoryListing(id);

// Reject
await rejectCommunityDirectoryListing(id);
```

#### Photo Operations

```typescript
// Upload
const url = await uploadCommunityDirectoryImage(file);

// Delete
await deleteCommunityDirectoryImage(imageUrl);
```

#### Filter Operations

```typescript
const districts = await getAvailableDistricts();
const cities = await getAvailableCitiesInDistrict('Chennai');
const communities = await getAvailableCommunities();
```

---

### 4. Types Layer

**File**: `src/integrations/supabase/community-directory-types.ts`

```typescript
// Main entity
export interface CommunityDirectoryListing {
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
  description?: string;
  function_type?: FunctionType;
  image_urls: string[];
  is_public: boolean;
  is_community_only: boolean;
  hide_address: boolean;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// Input for creation/update
export interface CommunityDirectoryInput {
  full_name: string;
  family_name: string;
  // ... similar fields without id, timestamps, approval fields
}

// Search/filter parameters
export interface CommunityDirectorySearchFilters {
  district?: string;
  city?: string;
  community_type?: string;
  family_name?: string;
  function_type?: FunctionType;
  search?: string;
  page?: number;
  limit?: number;
}

// Function types
export type FunctionType = 
  | 'Wedding'
  | 'Ear Piercing'
  | 'House Warming'
  | 'Temple Function'
  | 'Business'
  | 'Others';
```

---

## Common Patterns

### Pattern 1: Fetching with Loading States

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getCommunityDirectoryListing(id);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, [id]);
```

### Pattern 2: Form Submission with Validation

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ },
});

const onSubmit = async (values) => {
  try {
    if (isEdit) {
      await updateCommunityDirectoryListing(id, values);
    } else {
      await createCommunityDirectoryListing(values);
    }
    onSuccess?.();
  } catch (err) {
    setError(err.message);
  }
};
```

### Pattern 3: Search with Filters

```typescript
const handleFilterChange = useCallback(async (newFilters) => {
  try {
    const { listings, total } = await searchCommunityDirectoryListings({
      ...newFilters,
      page: 1,
      limit: 12,
    });
    setListings(listings);
    setTotal(total);
  } catch (err) {
    console.error('Search error:', err);
  }
}, []);
```

### Pattern 4: Photo Upload

```typescript
const handlePhotoUpload = async (files) => {
  for (const file of files) {
    try {
      const url = await uploadCommunityDirectoryImage(file);
      setPhotos(prev => [...prev, url]);
    } catch (err) {
      console.error('Upload error:', err);
    }
  }
};
```

---

## Database Queries

### Useful SQL Queries

```sql
-- Get all pending approvals
SELECT * FROM community_directory 
WHERE is_approved = FALSE 
ORDER BY created_at ASC;

-- Get listings by district
SELECT * FROM community_directory 
WHERE district = 'Chennai' AND is_approved = TRUE;

-- Get statistics
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN is_approved = FALSE THEN 1 ELSE 0 END) as pending
FROM community_directory;

-- Get most active communities
SELECT community_type, COUNT(*) as count
FROM community_directory
WHERE is_approved = TRUE
GROUP BY community_type
ORDER BY count DESC;
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "User not authenticated" | API call without login | Redirect to login before API call |
| "Unauthorized to update" | Editing someone else's listing | Check user_id matches |
| "Photo upload failed" | Bucket not public | Set bucket to public or use signed URLs |
| "RLS policy violation" | Database policy blocked access | Check user's is_approved status |
| "Phone format invalid" | Invalid phone number | Validate with regex before submit |

---

## Performance Optimization

### Index Strategy
Database uses indexes on:
- `user_id` - for user's listings
- `is_approved` - for approval workflows
- `district`, `city` - for location searches
- `community_type` - for community filtering
- `family_name` - for name searches
- `created_at` - for recent listings
- `search_text` (GIN) - for full-text search

### Query Optimization
- Use pagination (default 12 items per page)
- Implement lazy loading for images
- Cache filter options (districts, communities)
- Use debouncing for search inputs

---

## Testing Checklist

```
Registration:
☐ Submit form with all fields
☐ Submit with optional fields empty
☐ Test photo upload (single and multiple)
☐ Test form validation errors
☐ Test success notification

Search:
☐ Filter by each individual field
☐ Combine multiple filters
☐ Test pagination
☐ Test "Load More" button
☐ Clear filters button

Profile View:
☐ View own profile
☐ View others' profiles
☐ Test WhatsApp link
☐ Test call link
☐ Test email link
☐ Test share functionality

Admin:
☐ Approve pending profile
☐ Reject pending profile
☐ View approved profiles
☐ Edit own profile
☐ Delete profile

Privacy:
☐ Test public profile visibility
☐ Test community-only visibility
☐ Test address hiding
```

---

## Deployment Checklist

- [ ] Database migration applied
- [ ] Supabase Storage bucket created
- [ ] Environment variables configured
- [ ] Admin users assigned
- [ ] Routes generated by Tanstack Router
- [ ] i18n translations verified
- [ ] Mobile responsiveness tested
- [ ] PhotoUpload functionality verified
- [ ] WhatsApp links tested
- [ ] Admin approval workflow tested

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Router](https://tanstack.com/router)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: May 12, 2026
**Version**: 1.0
**Status**: Production Ready ✓

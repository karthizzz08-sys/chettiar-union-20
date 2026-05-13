# Quick Testing Guide - Register Your Family Feature

## 🧪 Testing Checklist

### Phase 1: UI/UX Testing

#### Homepage Testing
- [ ] Visit homepage
- [ ] See "Register Your Family" button with Heart icon
- [ ] Click button opens modal (doesn't navigate)
- [ ] Modal has proper title and description
- [ ] Modal closes when clicking X

#### Form Testing
- [ ] All form fields display correctly
- [ ] Required fields marked with *
- [ ] Form is scrollable on mobile
- [ ] Layout is responsive (2 columns on desktop, 1 on mobile)
- [ ] Submit button is visible

#### Field Validation
- [ ] Family Name: Requires min 2 characters
- [ ] Contact Person: Requires min 2 characters
- [ ] Email: Must be valid email format
- [ ] Phone: Requires 10+ digits
- [ ] District: Dropdown works properly
- [ ] Form shows error messages for invalid fields

---

### Phase 2: Functional Testing

#### Form Submission
```
Steps:
1. Open modal from homepage
2. Fill all required fields:
   - Family Name: "Chettiar"
   - Contact Person: "John Doe"
   - Full Name: "John Doe"
   - Community Type: "Chettiar"
   - Mobile: "9876543210"
   - Email: "john@example.com"
   - Address: "123 Main St"
   - City: "Chennai"
   - District: "Chennai"
3. Click Submit
4. Verify success message appears
5. Form resets after submission

Expected Result: ✅ Success message shown, form cleared
```

#### Database Verification
```sql
-- In Supabase, check:
SELECT id, family_name, phone, guest_email, is_approved 
FROM community_directory 
WHERE guest_email IS NOT NULL
LIMIT 5;

Expected:
- guest_email = filled
- guest_phone = filled
- user_id = NULL
- is_approved = false
```

#### Phone Masking Test
```
Steps:
1. Create a test approved listing (or admin-approve existing guest submission)
2. Go to /community-directory
3. View the listing card
4. Verify phone shows as: 98765XXXXX (masked)
5. Click "Call" button
6. Verify full number is used in tel: link

Expected Result: ✅ Phone masked in display, full number works on click
```

---

### Phase 3: Admin Approval Testing

#### Pending Submissions
```
Steps:
1. Create guest submission (see Phase 2)
2. Admin checks Supabase admin dashboard
3. View community_directory table
4. Find row with is_approved = false

Expected Result: ✅ New guest submission appears as pending
```

#### Approval Workflow
```
Steps:
1. Admin finds pending submission
2. Admin updates is_approved = true
3. User browses /community-directory
4. Verify listing now appears (no longer hidden)
5. Verify phone is still masked

Expected Result: ✅ Approved entry visible, privacy maintained
```

---

### Phase 4: Grouping & Filtering Test

#### District Grouping
```
Steps:
1. Admin approves guest submissions from different districts:
   - 2 from Chennai
   - 2 from Coimbatore
   - 2 from Madurai
2. User goes to /community-directory
3. Listings should be grouped:
   - Chennai (2) - collapsible
     - Some City (1)
     - Another City (1)
   - Coimbatore (2)
   - Madurai (2)

Expected Result: ✅ Clean grouping by district, cities nested
```

#### Filter by District
```
Steps:
1. Select "Chennai" from district filter
2. Verify only Chennai listings show
3. Verify grouping still works
4. Select "Coimbatore"
5. Verify only Coimbatore listings show

Expected Result: ✅ Filtering works with grouping
```

#### Search Functionality
```
Steps:
1. Type family name in search
2. Verify results filtered
3. Try searching by profession
4. Verify profession filter works

Expected Result: ✅ All search filters work
```

---

### Phase 5: Responsive Design Testing

#### Mobile (iPhone/Android Simulator)
```
Device: Mobile 375x667

Checklist:
- [ ] Modal takes full screen (with padding)
- [ ] Form fields stack vertically
- [ ] Buttons are full-width and clickable
- [ ] Input fields are large enough (44px+)
- [ ] No horizontal scroll
- [ ] Text is readable (no zoom needed)
- [ ] Submit button accessible
- [ ] Success message readable
- [ ] District grouping collapses properly

Expected Result: ✅ All mobile UI elements work
```

#### Tablet (iPad/Tablet Simulator)
```
Device: Tablet 768x1024

Checklist:
- [ ] 2-column form layout works
- [ ] Modal size appropriate
- [ ] Cards display nicely
- [ ] Grouping shows properly

Expected Result: ✅ Tablet layout optimal
```

#### Desktop
```
Device: Desktop 1920x1080

Checklist:
- [ ] Modal centered with max-width
- [ ] 2-column form layout
- [ ] 3-column card grid
- [ ] Smooth hover effects
- [ ] All interactive elements work

Expected Result: ✅ Desktop layout perfect
```

---

### Phase 6: Edge Cases

#### Empty Form Submission
```
Steps:
1. Open modal
2. Click Submit without filling fields
3. Verify error messages show for each field

Expected Result: ✅ Validation errors displayed
```

#### Invalid Email
```
Steps:
1. Fill form with email: "notanemail"
2. Submit
3. Verify error message for email field

Expected Result: ✅ Email validation works
```

#### Short Phone Number
```
Steps:
1. Fill phone with "123"
2. Submit
3. Verify error message

Expected Result: ✅ Phone validation works
```

#### Special Characters in Phone
```
Steps:
1. Fill phone with "+91-9876543210"
2. Submit (should work - digits extracted)

Expected Result: ✅ Special characters handled
```

---

### Phase 7: Performance Testing

#### Loading Speed
```
- [ ] Modal opens quickly
- [ ] Form renders without lag
- [ ] Directory loads <2 seconds with 50+ listings
- [ ] Grouping/collapsing is smooth
- [ ] No console errors

Expected Result: ✅ Performance acceptable
```

#### Data Integrity
```
Steps:
1. Create multiple guest submissions
2. Admin approves some, rejects others
3. Verify approved listings appear
4. Verify rejected listings don't appear
5. Check database entries are correct

Expected Result: ✅ Data integrity maintained
```

---

### Phase 8: Browser Compatibility

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

For each browser:
- [ ] Modal opens/closes properly
- [ ] Form submits successfully
- [ ] Masking works correctly
- [ ] Grouping displays properly
- [ ] No console errors

---

## 🔍 What to Look For

### Success Indicators ✅
- Form validation catches errors
- Success messages display after submission
- Modal closes after submission
- Phone numbers masked in listings
- Listings grouped by district/city
- Admin approval system works
- Responsive design works on all devices
- No console errors

### Problem Areas ❌
- Form hangs on submit
- Modal doesn't close
- Phone numbers not masked
- Grouping displays incorrectly
- Validation errors unclear
- Mobile layout broken
- Console errors present

---

## 📋 Test Data

Use this data for manual testing:

```javascript
const testData = {
  family_name: "Chettiar",
  contact_person_name: "Rajesh Kumar",
  full_name: "Rajesh Kumar Chettiar",
  community_type: "Chettiar",
  gothram: "Vishvamitra",
  district: "Chennai",
  city: "Chennai",
  address: "123 Main Street, Chennai, TN 600001",
  phone: "9876543210",
  email: "rajesh@example.com",
  profession: "IT Professional",
  description: "Looking for business partnerships and community connections"
};
```

---

## 🔧 Debug Commands

### Check Pending Submissions
```sql
SELECT 
  id, 
  family_name, 
  guest_email, 
  created_at, 
  is_approved 
FROM community_directory 
WHERE is_approved = false
ORDER BY created_at DESC;
```

### Check Approved Listings
```sql
SELECT 
  id, 
  family_name, 
  district, 
  city, 
  is_approved 
FROM community_directory 
WHERE is_approved = true
ORDER BY district, city;
```

### Check Phone Masking
```bash
# In browser console:
import { maskPhoneNumber } from '@/lib/phone-masking';
maskPhoneNumber("9876543210"); // Should return "98765XXXXX"
```

---

## 📝 Notes

- Clear browser cache if seeing old version
- Check Network tab if form submission hangs
- Look for 400/500 errors in Network tab
- Mobile testing needs real device or good simulator
- Test with both new and existing listings

---

**Created:** May 13, 2026
**Status:** Ready for Testing

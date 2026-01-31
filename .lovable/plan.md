
# Admin Panel Enhancement Plan

## Summary
Admin Panel-এ উপজেলা ও ওয়ার্ড/ইউনিয়ন ভিত্তিক ডাটা আপলোড, ফিল্টারিং, এবং বাল্ক ডিলিট ফিচার যোগ করা হবে।

## New Features

### 1. উপজেলা ও ওয়ার্ড/ইউনিয়ন ফিল্টার
- আপলোডের সময় উপজেলা ও ওয়ার্ড/ইউনিয়ন সিলেক্ট করার ড্রপডাউন
- ভোটার লিস্টে ফিল্টার অপশন (সব দেখাও / নির্দিষ্ট এলাকার ভোটার)
- ইউজার পেজেও একই ফিল্টার থাকবে সার্চের সুবিধার জন্য

### 2. বাল্ক ডিলিট ফিচার
- সব সিলেক্ট করার চেকবক্স
- একাধিক ভোটার সিলেক্ট করে একসাথে ডিলিট
- এলাকা অনুযায়ী সব ভোটার ডিলিট করার অপশন

### 3. User Section
- ইউজার সেকশন আলাদা রাখা ভালো কারণ:
  - ইউজাররা শুধু সার্চ করতে পারবে (Read-only)
  - অ্যাডমিনরা CRUD অপারেশন করতে পারবে
  - সিকিউরিটি আলাদা থাকবে

---

## Technical Implementation

### Phase 1: Database Schema Update

**Add new columns to `voters` table:**
```sql
ALTER TABLE voters ADD COLUMN upazila TEXT;
ALTER TABLE voters ADD COLUMN ward_union TEXT;
```

**Create location reference tables:**
```sql
CREATE TABLE upazilas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wards_unions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  upazila_id UUID REFERENCES upazilas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Phase 2: Type Updates

**Update `src/types/database.ts`:**
- Add `upazila` and `ward_union` fields to Voter interface
- Create new interfaces for Upazila and WardUnion

### Phase 3: Admin Dashboard Updates

**Enhanced DataUploadCard:**
- Add upazila dropdown selector
- Add ward/union dropdown selector (dependent on upazila)
- Auto-assign selected location to uploaded data

**Voter List with Filters:**
- Add location filter dropdowns above the table
- Filter voters by upazila and ward/union

**Bulk Delete Feature:**
- Add checkbox column in table
- "Select All" checkbox in header
- "Delete Selected" button with confirmation
- "Delete by Area" option

### Phase 4: User Section Filters

**Update Index page:**
- Add location filter dropdowns for search
- Filter search results by area

---

## UI Changes Preview

```text
+--------------------------------------------------+
|  Admin Dashboard                                 |
+--------------------------------------------------+
|                                                  |
|  +--------------------+  +--------------------+  |
|  | মোট ভোটার: 1,234   |  | ডাটা আপলোড         |  |
|  +--------------------+  |                    |  |
|                          | উপজেলা: [Dropdown] |  |
|                          | ওয়ার্ড:  [Dropdown] |  |
|                          | [File/Text Upload] |  |
|                          +--------------------+  |
|                                                  |
|  +----------------------------------------------+|
|  | ভোটার তালিকা                                 ||
|  | Filter: [উপজেলা v] [ওয়ার্ড v] [Search...]    ||
|  | [x] Select All    [Delete Selected] (3)      ||
|  +----------------------------------------------+|
|  | [ ] | ক্রমিক | নাম | ভোটার নং | এলাকা | Action||
|  | [x] | 001   | ... | ...     | ...   | Edit  ||
|  | [ ] | 002   | ... | ...     | ...   | Edit  ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add upazila, ward_union columns + reference tables |
| `src/types/database.ts` | Modify | Add new type definitions |
| `src/components/DataUploadCard.tsx` | Modify | Add location selectors |
| `src/components/LocationFilter.tsx` | Create | Reusable location dropdown component |
| `src/pages/AdminDashboard.tsx` | Modify | Add filters, bulk delete, location display |
| `src/pages/Index.tsx` | Modify | Add location filter for user search |
| `src/hooks/useLocations.ts` | Create | Hook to fetch upazilas and wards |

---

## Benefits

1. **Organized Data**: এলাকা অনুযায়ী ডাটা সাজানো থাকবে
2. **Easy Management**: নির্দিষ্ট এলাকার ডাটা সহজে ম্যানেজ করা যাবে
3. **Bulk Operations**: অনেক ভোটার একসাথে ডিলিট করা যাবে
4. **Better Search**: ইউজাররা এলাকা ফিল্টার করে সার্চ করতে পারবে

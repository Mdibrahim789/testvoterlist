
# Constituency & Candidates Feature Plan

## Summary
নির্বাচনী আসন (Constituency) এবং প্রার্থীদের তথ্য (Candidates) যোগ করা হবে। ইউজার সার্চ পেজে নিচে আসনের নাম এবং প্রার্থীদের তালিকা দেখাবে। অ্যাডমিন সব তথ্য Add/Edit করতে পারবে।

---

## New Features

### 1. Constituency (আসন) তথ্য
- আসনের নাম (যেমন: "ঢাকা-১২")
- একটি আসনের তথ্য স্টোর করা হবে (Single Row)

### 2. Candidates (প্রার্থী) তথ্য
- ক্রম নম্বর
- দাখিলকারীর নাম
- ছবি (Image URL)
- রাজনৈতিক দল/স্বতন্ত্র
- নির্বাচনী প্রতীক

### 3. Admin Panel
- আসনের নাম Add/Edit করার ফর্ম
- প্রার্থী Add/Edit/Delete করার ফিচার
- ছবি আপলোড করার সুবিধা (Image URL)

### 4. User Page
- পেজের নিচে আসনের নাম দেখাবে
- প্রার্থীদের সুন্দর টেবিল দেখাবে (যেমন ছবিতে দেখানো হয়েছে)

---

## Database Schema

### New Tables

**`constituency` table:**
```sql
CREATE TABLE constituency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default row
INSERT INTO constituency (name) VALUES ('আসনের নাম');
```

**`candidates` table:**
```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no INTEGER NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  party_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE constituency ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read constituency" ON constituency FOR SELECT USING (true);
CREATE POLICY "Allow public read candidates" ON candidates FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Allow admin insert constituency" ON constituency FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update constituency" ON constituency FOR UPDATE USING (true);
CREATE POLICY "Allow admin insert candidates" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update candidates" ON candidates FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete candidates" ON candidates FOR DELETE USING (true);
```

---

## UI Preview

### User Page (নিচের অংশে)
```text
+--------------------------------------------------+
|                                                  |
|  ╔══════════════════════════════════════════╗   |
|  ║  আসন: ঢাকা-১২ (বোর্ড অফ কন্ট্রোলার)       ║   |
|  ╚══════════════════════════════════════════╝   |
|                                                  |
|  +----------------------------------------------+|
|  |  প্রার্থী তালিকা                              ||
|  +----------------------------------------------+|
|  | ক্রম | নাম           | ছবি | দল        | প্রতীক ||
|  +----------------------------------------------+|
|  |  ১  | মোঃ মাসুদ    | [img] | জামায়াতে  | দাঁড়িপাল্লা ||
|  |  ২  | মোঃ শরীফ     | [img] | বি.এন.পি  | ধানের শীষ ||
|  |  ৩  | মোহাম্মদ জহুরুল | [img] | ইসলামী  | হাতপাখা ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

### Admin Panel (নতুন সেকশন)
```text
+--------------------------------------------------+
|  আসন ও প্রার্থী ব্যবস্থাপনা                        |
+--------------------------------------------------+
|                                                  |
|  আসনের নাম: [______________] [সেভ করুন]          |
|                                                  |
|  +----------------------------------------------+|
|  | প্রার্থী যোগ করুন                              ||
|  | নাম: [________]  দল: [________]              ||
|  | প্রতীক: [________]  ছবি URL: [________]        ||
|  | [+ যোগ করুন]                                  ||
|  +----------------------------------------------+|
|                                                  |
|  +----------------------------------------------+|
|  | প্রার্থী তালিকা                    [সব মুছুন]  ||
|  +----------------------------------------------+|
|  | ক্রম | নাম | দল | প্রতীক | Actions           ||
|  | 1  | ... | ... | ...  | [Edit] [Delete]     ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/types/database.ts` | Modify | Add Constituency and Candidate interfaces |
| `src/hooks/useConstituency.ts` | Create | Hook for constituency data |
| `src/hooks/useCandidates.ts` | Create | Hook for candidates CRUD |
| `src/components/ConstituencyCard.tsx` | Create | Display constituency info |
| `src/components/CandidatesTable.tsx` | Create | Display candidates table |
| `src/components/CandidateManagement.tsx` | Create | Admin candidate management |
| `src/pages/AdminDashboard.tsx` | Modify | Add constituency/candidates section |
| `src/pages/Index.tsx` | Modify | Show constituency and candidates |

---

## Implementation Steps

### Step 1: Database Setup (Manual SQL in Supabase)
- Create `constituency` and `candidates` tables
- Add RLS policies for public read and admin write

### Step 2: Type Definitions
- Add `Constituency` and `Candidate` interfaces
- Add insert/update types

### Step 3: Custom Hooks
- `useConstituency`: Fetch and update constituency name
- `useCandidates`: Fetch, add, edit, delete candidates

### Step 4: UI Components
- `ConstituencyCard`: Shows constituency name with nice styling
- `CandidatesTable`: Displays candidates with photo, party, symbol
- `CandidateManagement`: Admin form for managing candidates

### Step 5: Page Integration
- Add components to Index.tsx (user view)
- Add management section to AdminDashboard.tsx

---

## Benefits

1. **Complete Election Info**: ইউজাররা আসন ও প্রার্থী সব দেখতে পাবে
2. **Easy Management**: অ্যাডমিন সহজে সব তথ্য আপডেট করতে পারবে
3. **Visual Appeal**: ছবি ও প্রতীক সহ সুন্দর প্রেজেন্টেশন
4. **Flexible**: যেকোনো আসনের জন্য ব্যবহার করা যাবে


# ভোটার অনুসন্ধান (Voter Search) Web App - Updated Plan

## Overview
একটি পূর্ণাঙ্গ Bangla voter search application যেখানে Supabase backend ব্যবহার করা হবে। পাবলিক ইউজাররা লগইন ছাড়াই সার্চ করতে পারবে, এবং অ্যাডমিনরা আলাদা প্যানেল থেকে ডাটা ম্যানেজ করবে।

---

## Architecture

### Frontend Pages
- `/` - Public voter search page (লগইন ছাড়া)
- `/admin` - Admin login page (email + password)
- `/admin/dashboard` - Admin panel (protected)

### Backend (Supabase)
- Database tables for voters and user roles
- Row Level Security (RLS) for data protection
- Authentication for admin users

---

## Features

### 1. Public Search Page (`/`)
- **Header**: "ভোটার অনুসন্ধান" with filter icon
- **Search Form**:
  - Date of Birth input (DD-MM-YYYY text format)
  - Name input (Bangla partial match)
  - Reset and Search buttons
- **Instructions Section**: "কিভাবে ভোটার খুঁজবেন?" with step-by-step guide
- **Results**: Clean voter cards with masked voter numbers
- **No Login Required**: যেকেউ সার্চ করতে পারবে
- **Design**: Soft green theme, mobile-first, rounded corners

### 2. Admin Login Page (`/admin`)
- Email and Password login form
- Bangla labels and messages
- Error handling for invalid credentials
- Only approved admins can access

### 3. Admin Dashboard (`/admin/dashboard`)
**Protected Route** - শুধু অ্যাডমিনরা দেখতে পারবে

#### Features:
- **Data Upload**: CSV/JSON file upload করে voter data যোগ করা
- **Voter List View**: সব voter এর তালিকা দেখা (paginated table)
- **Edit Voter**: যেকোনো voter এর তথ্য এডিট করা
- **Delete Voter**: voter ডিলিট করা
- **Search/Filter**: Admin panel এও সার্চ করা যাবে
- **Logout Button**: সেশন শেষ করা

### 4. Admin Management System
- **Signup Flow**: নতুন ইউজার সাইনআপ করতে পারবে
- **Approval System**: Signup এর পর ইউজার pending থাকবে
- **Manual Approval**: বর্তমান admin নতুন admin কে approve করবে
- **Role-based Access**: শুধু approved admin রা dashboard অ্যাক্সেস করতে পারবে

---

## Database Schema (Supabase)

### Tables:
1. **voters** - Voter data storage
   - `id`, `sl`, `voter_no`, `name_bn`, `father_husband`, `dob`, `address`, `area`, `created_at`
   
2. **user_roles** - Admin role management
   - `id`, `user_id`, `role` (enum: admin, pending_admin)
   - RLS policies for security

### Security:
- Public read access for voter search (with rate limiting consideration)
- Write/Edit/Delete only for approved admins
- Secure role checking with security definer functions

---

## Design & UX
- **Public Pages**: Soft green theme (#4CAF50), clean cards, Bangla text
- **Admin Panel**: Professional dashboard layout, data tables, action buttons
- **Mobile Responsive**: Both public and admin sections
- **Bangla Throughout**: সব labels, messages, buttons বাংলায়

---

## User Flows

### Public User:
1. Visit homepage → See search form and instructions
2. Enter দুই জন্ম তারিখ এবং নাম → Click সার্চ
3. View matching voter cards with masked info

### New Admin Signup:
1. Go to `/admin` → Click "নতুন অ্যাকাউন্ট তৈরি করুন"
2. Enter email & password → Submit
3. See message "অনুমোদনের অপেক্ষায় আছে"
4. Wait for existing admin to approve

### Existing Admin:
1. Login at `/admin` → Enter credentials
2. Access dashboard → Upload/View/Edit/Delete voters
3. Approve pending admin requests (optional feature)


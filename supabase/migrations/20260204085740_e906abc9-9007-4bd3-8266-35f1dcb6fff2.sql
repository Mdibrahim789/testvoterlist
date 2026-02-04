-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'pending_admin');

-- Create voters table
CREATE TABLE public.voters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sl integer,
  voter_no text NOT NULL,
  name_bn text NOT NULL,
  father_husband text,
  dob text,
  address text,
  area text,
  upazila text,
  ward_union text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'pending_admin',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create upazilas table
CREATE TABLE public.upazilas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create wards_unions table
CREATE TABLE public.wards_unions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  upazila_id uuid NOT NULL REFERENCES public.upazilas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create constituency table
CREATE TABLE public.constituency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no integer NOT NULL,
  name text NOT NULL,
  photo_url text,
  party_name text NOT NULL,
  symbol text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster search
CREATE INDEX idx_voters_voter_no ON public.voters(voter_no);
CREATE INDEX idx_voters_name_bn ON public.voters(name_bn);
CREATE INDEX idx_voters_dob ON public.voters(dob);

-- Enable RLS on all tables
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upazilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards_unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- All permissions allowed policies
CREATE POLICY "Allow all on voters" ON public.voters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on upazilas" ON public.upazilas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on wards_unions" ON public.wards_unions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on constituency" ON public.constituency FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on candidates" ON public.candidates FOR ALL USING (true) WITH CHECK (true);
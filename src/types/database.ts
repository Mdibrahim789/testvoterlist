import { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

// Use the generated types from Supabase
export type Voter = Database['public']['Tables']['voters']['Row'];
export type VoterInsert = Database['public']['Tables']['voters']['Insert'];
export type VoterUpdate = Database['public']['Tables']['voters']['Update'];

export type UserRole = Database['public']['Tables']['user_roles']['Row'];

export type Upazila = Database['public']['Tables']['upazilas']['Row'];
export type WardUnion = Database['public']['Tables']['wards_unions']['Row'];

export type Constituency = Database['public']['Tables']['constituency']['Row'];
export type ConstituencyUpdate = Database['public']['Tables']['constituency']['Update'];

export type Candidate = Database['public']['Tables']['candidates']['Row'];
export type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
export type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

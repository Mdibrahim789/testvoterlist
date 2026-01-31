export type AppRole = 'admin' | 'pending_admin';

export interface Voter {
  id: string;
  sl: number | null;
  voter_no: string;
  name_bn: string;
  father_husband: string | null;
  dob: string | null;
  address: string | null;
  area: string | null;
  upazila: string | null;
  ward_union: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface VoterInsert {
  sl?: number | null;
  voter_no: string;
  name_bn: string;
  father_husband?: string | null;
  dob?: string | null;
  address?: string | null;
  area?: string | null;
  upazila?: string | null;
  ward_union?: string | null;
}

export interface VoterUpdate {
  sl?: number | null;
  voter_no?: string;
  name_bn?: string;
  father_husband?: string | null;
  dob?: string | null;
  address?: string | null;
  area?: string | null;
  upazila?: string | null;
  ward_union?: string | null;
}

export interface Upazila {
  id: string;
  name: string;
  created_at: string;
}

export interface WardUnion {
  id: string;
  name: string;
  upazila_id: string;
  created_at: string;
}

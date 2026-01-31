import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lekzlyawozcqmqrweetn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TKkok0AEkQK6XvvSp0JUVQ_s1TspC1L";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

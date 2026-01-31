import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upazila, WardUnion } from '@/types/database';

export function useLocations() {
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [wardsUnions, setWardsUnions] = useState<WardUnion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const [upazilasRes, wardsRes] = await Promise.all([
        supabase.from('upazilas').select('*').order('name'),
        supabase.from('wards_unions').select('*').order('name'),
      ]);

      if (upazilasRes.data) setUpazilas(upazilasRes.data as Upazila[]);
      if (wardsRes.data) setWardsUnions(wardsRes.data as WardUnion[]);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getWardsForUpazila = (upazilaId: string) => {
    return wardsUnions.filter((w) => w.upazila_id === upazilaId);
  };

  const addUpazila = async (name: string) => {
    const { data, error } = await supabase
      .from('upazilas')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    if (data) {
      setUpazilas((prev) => [...prev, data as Upazila].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return data as Upazila;
  };

  const addWardUnion = async (name: string, upazilaId: string) => {
    const { data, error } = await supabase
      .from('wards_unions')
      .insert({ name, upazila_id: upazilaId })
      .select()
      .single();
    
    if (error) throw error;
    if (data) {
      setWardsUnions((prev) => [...prev, data as WardUnion].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return data as WardUnion;
  };

  const refetch = () => fetchLocations();

  return {
    upazilas,
    wardsUnions,
    isLoading,
    getWardsForUpazila,
    addUpazila,
    addWardUnion,
    refetch,
  };
}

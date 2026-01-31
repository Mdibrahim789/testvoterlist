import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Constituency } from '@/types/database';

export function useConstituency() {
  const [constituency, setConstituency] = useState<Constituency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConstituency = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('constituency')
        .select('*')
        .limit(1)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setConstituency(data as Constituency | null);
      setError(null);
    } catch (err) {
      console.error('Error fetching constituency:', err);
      setError('আসনের তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConstituency = async (name: string) => {
    try {
      if (constituency) {
        // Update existing
        const { error: updateError } = await supabase
          .from('constituency')
          .update({ name, updated_at: new Date().toISOString() })
          .eq('id', constituency.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('constituency')
          .insert({ name });

        if (insertError) throw insertError;
      }

      await fetchConstituency();
      return { success: true };
    } catch (err) {
      console.error('Error updating constituency:', err);
      return { success: false, error: 'আসনের নাম সেভ করতে সমস্যা হয়েছে' };
    }
  };

  useEffect(() => {
    fetchConstituency();
  }, [fetchConstituency]);

  return {
    constituency,
    isLoading,
    error,
    updateConstituency,
    refetch: fetchConstituency,
  };
}

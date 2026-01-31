import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Candidate, CandidateInsert, CandidateUpdate } from '@/types/database';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('candidates')
        .select('*')
        .order('serial_no', { ascending: true });

      if (queryError) throw queryError;

      setCandidates(data as Candidate[] || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('প্রার্থী তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCandidate = async (candidate: CandidateInsert) => {
    try {
      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidate);

      if (insertError) throw insertError;

      await fetchCandidates();
      return { success: true };
    } catch (err) {
      console.error('Error adding candidate:', err);
      return { success: false, error: 'প্রার্থী যোগ করতে সমস্যা হয়েছে' };
    }
  };

  const updateCandidate = async (id: string, updates: CandidateUpdate) => {
    try {
      const { error: updateError } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchCandidates();
      return { success: true };
    } catch (err) {
      console.error('Error updating candidate:', err);
      return { success: false, error: 'প্রার্থী আপডেট করতে সমস্যা হয়েছে' };
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchCandidates();
      return { success: true };
    } catch (err) {
      console.error('Error deleting candidate:', err);
      return { success: false, error: 'প্রার্থী মুছতে সমস্যা হয়েছে' };
    }
  };

  const deleteAllCandidates = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) throw deleteError;

      await fetchCandidates();
      return { success: true };
    } catch (err) {
      console.error('Error deleting all candidates:', err);
      return { success: false, error: 'সব প্রার্থী মুছতে সমস্যা হয়েছে' };
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    isLoading,
    error,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    deleteAllCandidates,
    refetch: fetchCandidates,
  };
}

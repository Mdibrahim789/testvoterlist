import { useState } from 'react';
import { VoterSearchTabs } from '@/components/VoterSearchTabs';
import { SearchInstructions } from '@/components/SearchInstructions';
import { VoterCard } from '@/components/VoterCard';
import { supabase } from '@/integrations/supabase/client';
import { Voter } from '@/types/database';
import { Vote, Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (queryBuilder: any) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const { data, error: queryError } = await queryBuilder.limit(50);

      if (queryError) throw queryError;

      setVoters(data as Voter[] || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setVoters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoterNoSearch = (voterNo: string) => {
    const query = supabase.from('voters').select('*').ilike('voter_no', `%${voterNo}%`);
    executeSearch(query);
  };

  const handleNameDobSearch = (dob: string, name: string) => {
    if (!dob && !name) {
      setError('অনুগ্রহ করে জন্ম তারিখ অথবা নাম লিখুন');
      return;
    }

    let query = supabase.from('voters').select('*');

    if (dob) {
      query = query.eq('dob', dob);
    }

    if (name) {
      query = query.ilike('name_bn', `%${name}%`);
    }

    executeSearch(query);
  };

  const handleReset = () => {
    setVoters([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-bold">ভোটার অনুসন্ধান</h1>
          </div>
          <Link 
            to="/admin" 
            className="text-sm opacity-80 hover:opacity-100 transition-opacity"
          >
            অ্যাডমিন
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-4">
          {/* Tabbed Search */}
          <VoterSearchTabs 
            onVoterNoSearch={handleVoterNoSearch}
            onNameDobSearch={handleNameDobSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {hasSearched && !isLoading && !error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Search className="w-4 h-4" />
                <span className="text-sm">
                  {voters.length > 0 
                    ? `${voters.length}টি ফলাফল পাওয়া গেছে` 
                    : 'কোনো তথ্য পাওয়া যায়নি'}
                </span>
              </div>

              {voters.length > 0 ? (
                <div className="space-y-4">
                  {voters.map((voter) => (
                    <VoterCard key={voter.id} voter={voter} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    আপনার সার্চের সাথে কোনো ভোটার মেলেনি
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions (show when no search performed) */}
          {!hasSearched && <SearchInstructions />}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>© ২০২৫ ভোটার অনুসন্ধান সিস্টেম</p>
      </footer>
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { VoterSearchTabs } from '@/components/VoterSearchTabs';
import { SearchInstructions } from '@/components/SearchInstructions';
import { VoterCard } from '@/components/VoterCard';
import { ConstituencyCard } from '@/components/ConstituencyCard';
import { CandidatesTable } from '@/components/CandidatesTable';
import { useConstituency } from '@/hooks/useConstituency';
import { useCandidates } from '@/hooks/useCandidates';
import { supabase } from '@/integrations/supabase/client';
import { Voter } from '@/types/database';
import { Vote, Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

const Index = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const { constituency, isLoading: isConstituencyLoading } = useConstituency();
  const { candidates, isLoading: isCandidatesLoading } = useCandidates();

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
      setError(t('error.search'));
      setVoters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoterNoSearch = (voterNo: string) => {
    const query = supabase.from('voters').select('*').ilike('voter_no', `%${voterNo}%`);
    executeSearch(query);
  };

  const toBanglaDigits = (str: string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
  };

  const handleNameDobSearch = (dob: string, name: string) => {
    if (!dob && !name) {
      setError(t('error.dobOrName'));
      return;
    }

    let query = supabase.from('voters').select('*');

    if (dob) {
      let formattedDob = toBanglaDigits(dob)
        .replace(/-/g, '/')
        .replace(/^০/, '');
      query = query.ilike('dob', `%${formattedDob}%`);
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
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-bold">'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            Error ken</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link 
              to="/admin" 
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              {t('header.admin')}
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-4">
          <VoterSearchTabs 
            onVoterNoSearch={handleVoterNoSearch}
            onNameDobSearch={handleNameDobSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {hasSearched && !isLoading && !error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Search className="w-4 h-4" />
                <span className="text-sm">
                  {voters.length > 0 
                    ? `${voters.length}${t('results.found')}` 
                    : t('results.noData')}
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
                  <p className="text-muted-foreground">{t('results.noMatch')}</p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && <SearchInstructions />}

          <div className="space-y-4 mt-6">
            <ConstituencyCard name={constituency?.name || null} />
            <CandidatesTable 
              candidates={candidates} 
              isLoading={isCandidatesLoading} 
            />
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
};

export default Index;

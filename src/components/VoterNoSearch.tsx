import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface VoterNoSearchProps {
  onSearch: (voterNo: string) => void;
  isLoading?: boolean;
}

export function VoterNoSearch({ onSearch, isLoading }: VoterNoSearchProps) {
  const [voterNo, setVoterNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterNo.trim()) {
      onSearch(voterNo.trim());
    }
  };

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          ভোটার নং দিয়ে সার্চ
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            type="text"
            placeholder="ভোটার নম্বর লিখুন"
            value={voterNo}
            onChange={(e) => setVoterNo(e.target.value)}
            className="border-0 border-b-2 border-primary/30 rounded-none bg-transparent text-center text-lg py-3 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 h-12 text-lg font-semibold"
            disabled={isLoading || !voterNo.trim()}
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'খুঁজছি...' : 'সার্চ করুন'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

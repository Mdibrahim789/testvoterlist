import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CreditCard } from 'lucide-react';

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
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <CreditCard className="w-5 h-5" />
          ভোটার নং দিয়ে সার্চ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            placeholder="ভোটার নম্বর লিখুন..."
            value={voterNo}
            onChange={(e) => setVoterNo(e.target.value)}
            className="bg-background flex-1"
          />
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading || !voterNo.trim()}
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'খুঁজছি...' : 'সার্চ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RotateCcw, Filter, Calendar, User, CreditCard } from 'lucide-react';

interface SearchFormProps {
  onSearch: (dob: string, name: string, voterNo: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, onReset, isLoading }: SearchFormProps) {
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [voterNo, setVoterNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(dob, name, voterNo);
  };

  const handleReset = () => {
    setDob('');
    setName('');
    setVoterNo('');
    onReset();
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary text-xl">
          <Filter className="w-5 h-5" />
          ভোটার অনুসন্ধান
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voterNo" className="flex items-center gap-2 text-foreground">
              <CreditCard className="w-4 h-4" />
              ভোটার নং
            </Label>
            <Input
              id="voterNo"
              type="text"
              placeholder="ভোটার নম্বর লিখুন..."
              value={voterNo}
              onChange={(e) => setVoterNo(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4" />
              জন্ম তারিখ (DD-MM-YYYY)
            </Label>
            <Input
              id="dob"
              type="text"
              placeholder="যেমন: 15-08-1990"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4" />
              নাম (বাংলায়)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="বাংলায় নাম লিখুন..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              রিসেট
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'খুঁজছি...' : 'সার্চ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
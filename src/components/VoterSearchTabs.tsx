import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoterSearchTabsProps {
  onVoterNoSearch: (voterNo: string) => void;
  onNameDobSearch: (dob: string, name: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function VoterSearchTabs({ 
  onVoterNoSearch, 
  onNameDobSearch, 
  onReset,
  isLoading 
}: VoterSearchTabsProps) {
  const [activeTab, setActiveTab] = useState<'voterNo' | 'nameDob'>('voterNo');
  const [voterNo, setVoterNo] = useState('');
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');

  const handleVoterNoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterNo.trim()) {
      onVoterNoSearch(voterNo.trim());
    }
  };

  const handleNameDobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNameDobSearch(dob, name.trim());
  };

  const handleReset = () => {
    setVoterNo('');
    setDob('');
    setName('');
    onReset();
  };

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          ভোটার অনুসন্ধান
        </h2>

        {/* Tab Buttons */}
        <div className="flex bg-muted rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('voterNo')}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200",
              activeTab === 'voterNo'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            ভোটার নং
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nameDob')}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200",
              activeTab === 'nameDob'
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            নাম/জন্ম তারিখ
          </button>
        </div>

        {/* Voter No Search Form */}
        {activeTab === 'voterNo' && (
          <form onSubmit={handleVoterNoSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="ভোটার নম্বর লিখুন"
              value={voterNo}
              onChange={(e) => setVoterNo(e.target.value)}
              className="border-0 border-b-2 border-border rounded-none bg-transparent text-center text-lg py-3 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading || !voterNo.trim()}
            >
              <Search className="w-5 h-5 mr-2" />
              {isLoading ? 'খুঁজছি...' : 'সার্চ করুন'}
            </Button>
          </form>
        )}

        {/* Name/DOB Search Form */}
        {activeTab === 'nameDob' && (
          <form onSubmit={handleNameDobSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="জন্ম তারিখ (DD-MM-YYYY)"
              value={dob}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9-]/g, '');
                // Auto-add hyphen after day (2 digits) and month (5 chars = DD-MM)
                if (value.length === 2 && !value.includes('-')) {
                  value = value + '-';
                } else if (value.length === 5 && value.charAt(2) === '-' && value.charAt(4) !== '-') {
                  value = value.slice(0, 5) + '-' + value.slice(5);
                }
                // Limit to 10 chars (DD-MM-YYYY)
                if (value.length <= 10) {
                  setDob(value);
                }
              }}
              maxLength={10}
              className="border-0 border-b-2 border-border rounded-none bg-transparent text-lg py-3 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            <Input
              type="text"
              placeholder="নাম (বাংলায়)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-0 border-b-2 border-border rounded-none bg-transparent text-lg py-3 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={handleReset}
              >
                রিসেট
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-12 text-lg font-semibold"
                disabled={isLoading || (!dob && !name.trim())}
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? 'খুঁজছি...' : 'সার্চ'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

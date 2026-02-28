import { Candidate } from '@/types/database';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading?: boolean;
}

const toBanglaDigits = (num: number) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
};

export function CandidatesTable({ candidates, isLoading }: CandidatesTableProps) {
  const { t, lang } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('candidates.loading')}
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          {t('candidates.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">{t('candidates.serial')}</TableHead>
                <TableHead>{t('candidates.name')}</TableHead>
                <TableHead className="w-[60px]">{t('candidates.photo')}</TableHead>
                <TableHead>{t('candidates.party')}</TableHead>
                <TableHead className="w-[80px]">{t('candidates.symbol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="text-center font-medium">
                    {lang === 'bn' ? toBanglaDigits(candidate.serial_no) : candidate.serial_no}
                  </TableCell>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={candidate.photo_url || ''} alt={candidate.name} />
                      <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{candidate.party_name}</TableCell>
                  <TableCell>
                    {candidate.symbol ? (
                      <img src={candidate.symbol} alt="symbol" className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, MapPin, CreditCard, Hash } from 'lucide-react';
import { Voter } from '@/types/database';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoterCardProps {
  voter: Voter;
}

export function VoterCard({ voter }: VoterCardProps) {
  const { t } = useLanguage();
  const maskedVoterNo = voter.voter_no 
    ? '••••••••' + voter.voter_no.slice(-4) 
    : 'N/A';

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {voter.name_bn}
            </h3>
            {voter.father_husband && (
              <p className="text-sm text-muted-foreground">
                {t('voter.fatherHusband')}: {voter.father_husband}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          {voter.sl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span>{t('voter.serial')}: {voter.sl}</span>
            </div>
          )}

          {voter.dob && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{t('voter.dob')}: {voter.dob}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            <span>{t('voter.voterNo')}: {maskedVoterNo}</span>
          </div>

          {voter.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{voter.address}</span>
            </div>
          )}

          {voter.area && (
            <div className="inline-block px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs mt-1">
              {voter.area}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

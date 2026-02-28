import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function SearchInstructions() {
  const { t } = useLanguage();

  return (
    <Card className="bg-accent/30 border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <HelpCircle className="w-5 h-5" />
          {t('instructions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ১
          </div>
          <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: t('instructions.step1') }} />
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ২
          </div>
          <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: t('instructions.step2') }} />
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ৩
          </div>
          <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: t('instructions.step3') }} />
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('instructions.example') }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

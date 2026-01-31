import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, CheckCircle } from 'lucide-react';

export function SearchInstructions() {
  return (
    <Card className="bg-accent/30 border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <HelpCircle className="w-5 h-5" />
          কিভাবে ভোটার খুঁজবেন?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ১
          </div>
          <p className="text-sm text-foreground">
            ভোটারের <strong>জন্ম তারিখ</strong> লিখুন (DD-MM-YYYY ফরম্যাটে)
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ২
          </div>
          <p className="text-sm text-foreground">
            ভোটারের <strong>নামের যেকোনো অংশ</strong> বাংলায় লিখুন
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
            ৩
          </div>
          <p className="text-sm text-foreground">
            <strong>সার্চ</strong> বাটনে ক্লিক করুন
          </p>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              উদাহরণ: জন্ম তারিখ <strong className="text-foreground">15-08-1990</strong>, 
              নাম <strong className="text-foreground">মোহাম্মদ</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

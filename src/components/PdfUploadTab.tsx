import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VoterInsert } from '@/types/database';
import { FileText, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedVoter {
  sl: number | null;
  voter_no: string;
  name_bn: string;
  father_husband: string;
  dob: string;
  address: string;
}

interface PdfUploadTabProps {
  upazila: string | null;
  wardUnion: string | null;
  onUploadSuccess: () => void;
}

export function PdfUploadTab({ upazila, wardUnion, onUploadSuccess }: PdfUploadTabProps) {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedVoters, setExtractedVoters] = useState<ExtractedVoter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setExtractedVoters([]);
      setError(null);
    } else if (file) {
      toast({
        title: 'ভুল ফাইল টাইপ',
        description: 'শুধুমাত্র PDF ফাইল আপলোড করুন',
        variant: 'destructive',
      });
    }
  };

  const extractFromPdf = async () => {
    if (!pdfFile) return;

    setIsExtracting(true);
    setError(null);

    try {
      // Convert PDF to base64
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        'extract-voters-from-pdf',
        {
          body: { pdfBase64: base64 },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.voters || data.voters.length === 0) {
        setError('PDF থেকে কোনো ভোটার তথ্য পাওয়া যায়নি। অন্য PDF দিয়ে চেষ্টা করুন।');
        return;
      }

      setExtractedVoters(data.voters);
      toast({
        title: 'এক্সট্র্যাক্ট সফল!',
        description: `${data.voters.length}টি ভোটার পাওয়া গেছে`,
      });
    } catch (err) {
      console.error('PDF extraction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'PDF প্রসেস করতে সমস্যা হয়েছে';
      setError(errorMessage);
      toast({
        title: 'এক্সট্র্যাক্ট ব্যর্থ',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const saveToDatabase = async () => {
    if (extractedVoters.length === 0) return;

    setIsSaving(true);

    try {
      const votersToInsert: VoterInsert[] = extractedVoters.map((v) => ({
        sl: v.sl,
        voter_no: v.voter_no || '',
        name_bn: v.name_bn || '',
        father_husband: v.father_husband || '',
        dob: v.dob || '',
        address: v.address || '',
        area: '',
        upazila: upazila,
        ward_union: wardUnion,
      }));

      const { error: insertError } = await supabase.from('voters').insert(votersToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'সফল হয়েছে!',
        description: `${votersToInsert.length}টি ভোটার ডাটাবেসে যোগ করা হয়েছে`,
      });

      // Reset state
      setPdfFile(null);
      setExtractedVoters([]);
      onUploadSuccess();
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'সেভ ব্যর্থ',
        description: 'ডাটাবেসে সেভ করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* PDF Upload Area */}
      <Label htmlFor="pdf-upload" className="cursor-pointer">
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {pdfFile ? pdfFile.name : 'ভোটার তালিকার PDF আপলোড করুন'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            AI অটো ডাটা বের করবে ✨
          </p>
        </div>
        <Input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isExtracting || isSaving}
        />
      </Label>

      {/* Extract Button */}
      {pdfFile && extractedVoters.length === 0 && (
        <Button
          onClick={extractFromPdf}
          disabled={isExtracting}
          className="w-full"
          variant="outline"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI এক্সট্র্যাক্ট করছে...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI দিয়ে এক্সট্র্যাক্ট করুন
            </>
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Preview Table */}
      {extractedVoters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              প্রিভিউ: {extractedVoters.length}টি ভোটার পাওয়া গেছে
            </p>
          </div>

          <ScrollArea className="h-[200px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ক্রম</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>ভোটার নং</TableHead>
                  <TableHead>পিতা/স্বামী</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedVoters.map((voter, index) => (
                  <TableRow key={index}>
                    <TableCell>{voter.sl || index + 1}</TableCell>
                    <TableCell>{voter.name_bn}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {voter.voter_no}
                    </TableCell>
                    <TableCell>{voter.father_husband}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <Button
            onClick={saveToDatabase}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                সেভ হচ্ছে...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                ডাটাবেসে যোগ করুন
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

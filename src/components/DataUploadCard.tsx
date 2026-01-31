import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VoterInsert } from '@/types/database';
import { Upload, FileJson, FileText, Plus, AlertCircle } from 'lucide-react';

interface DataUploadCardProps {
  onUploadSuccess: () => void;
}

export function DataUploadCard({ onUploadSuccess }: DataUploadCardProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [textData, setTextData] = useState('');
  const [textFormat, setTextFormat] = useState<'csv' | 'json'>('csv');

  const parseCSV = (text: string): VoterInsert[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: VoterInsert[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      
      if (row.voter_no || row.name_bn || row.name) {
        data.push({
          sl: row.sl ? parseInt(row.sl) : null,
          voter_no: row.voter_no || '',
          name_bn: row.name_bn || row.name || '',
          father_husband: row.father_husband || '',
          dob: row.dob || '',
          address: row.address || '',
          area: row.area || '',
        });
      }
    }
    return data;
  };

  const parseJSON = (text: string): VoterInsert[] => {
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item: any) => ({
        sl: item.sl ? parseInt(item.sl) : null,
        voter_no: item.voter_no || '',
        name_bn: item.name_bn || item.name || '',
        father_husband: item.father_husband || '',
        dob: item.dob || '',
        address: item.address || '',
        area: item.area || '',
      })).filter(v => v.voter_no || v.name_bn);
    } catch {
      return [];
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      let data: VoterInsert[] = [];

      if (file.name.endsWith('.json')) {
        data = parseJSON(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      }

      if (data.length === 0) {
        throw new Error('No valid data found');
      }

      const { error } = await supabase.from('voters').insert(data);

      if (error) throw error;

      toast({
        title: 'সফল হয়েছে!',
        description: `${data.length}টি ভোটার যোগ করা হয়েছে`,
      });

      onUploadSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: 'আপলোড ব্যর্থ',
        description: 'ফাইল আপলোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleTextUpload = async () => {
    if (!textData.trim()) {
      toast({
        title: 'ডাটা নেই',
        description: 'অনুগ্রহ করে ডাটা ইনপুট করুন',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      let data: VoterInsert[] = [];

      if (textFormat === 'json') {
        data = parseJSON(textData);
      } else {
        data = parseCSV(textData);
      }

      if (data.length === 0) {
        throw new Error('No valid data found');
      }

      const { error } = await supabase.from('voters').insert(data);

      if (error) throw error;

      toast({
        title: 'সফল হয়েছে!',
        description: `${data.length}টি ভোটার যোগ করা হয়েছে`,
      });

      setTextData('');
      onUploadSuccess();
    } catch (err) {
      console.error('Text upload error:', err);
      toast({
        title: 'আপলোড ব্যর্থ',
        description: 'ডাটা প্রসেস করতে সমস্যা হয়েছে। ফরম্যাট চেক করুন।',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="w-5 h-5" />
          ডাটা আপলোড
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              ফাইল আপলোড
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              টেক্সট ইনপুট
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                <FileJson className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploading ? 'আপলোড হচ্ছে...' : 'CSV/JSON ফাইল আপলোড করুন'}
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </Label>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={textFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTextFormat('csv')}
              >
                CSV
              </Button>
              <Button
                type="button"
                variant={textFormat === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTextFormat('json')}
              >
                JSON
              </Button>
            </div>

            <Textarea
              placeholder={
                textFormat === 'csv'
                  ? `sl,voter_no,name_bn,father_husband,dob,address,area
1,1234567890,মোঃ আবদুল করিম,মোঃ রহিম উদ্দিন,15-08-1990,গ্রাম: পাড়া,ঢাকা`
                  : `[
  {
    "sl": 1,
    "voter_no": "1234567890",
    "name_bn": "মোঃ আবদুল করিম",
    "father_husband": "মোঃ রহিম উদ্দিন",
    "dob": "15-08-1990",
    "address": "গ্রাম: পাড়া",
    "area": "ঢাকা"
  }
]`
              }
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {textFormat === 'csv'
                  ? 'প্রথম লাইনে হেডার দিন: sl,voter_no,name_bn,father_husband,dob,address,area'
                  : 'JSON অ্যারে অথবা সিঙ্গেল অবজেক্ট দিতে পারেন'}
              </p>
            </div>

            <Button
              onClick={handleTextUpload}
              disabled={isUploading || !textData.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isUploading ? 'আপলোড হচ্ছে...' : 'ডাটা যোগ করুন'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

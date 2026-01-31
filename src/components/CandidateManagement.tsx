import { useState } from 'react';
import { Candidate, CandidateInsert } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, MapPin, Users, User } from 'lucide-react';

interface CandidateManagementProps {
  constituencyName: string | null;
  candidates: Candidate[];
  isLoading: boolean;
  onUpdateConstituency: (name: string) => Promise<{ success: boolean; error?: string }>;
  onAddCandidate: (candidate: CandidateInsert) => Promise<{ success: boolean; error?: string }>;
  onUpdateCandidate: (id: string, updates: Partial<Candidate>) => Promise<{ success: boolean; error?: string }>;
  onDeleteCandidate: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteAllCandidates: () => Promise<{ success: boolean; error?: string }>;
}

export function CandidateManagement({
  constituencyName,
  candidates,
  isLoading,
  onUpdateConstituency,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onDeleteAllCandidates,
}: CandidateManagementProps) {
  const { toast } = useToast();
  
  // Constituency form
  const [editingConstituencyName, setEditingConstituencyName] = useState(constituencyName || '');
  const [isSavingConstituency, setIsSavingConstituency] = useState(false);
  
  // Candidate form
  const [candidateForm, setCandidateForm] = useState<CandidateInsert>({
    serial_no: candidates.length + 1,
    name: '',
    photo_url: '',
    party_name: '',
    symbol: '',
  });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  
  // Edit dialog
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState<Partial<Candidate>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Delete all dialog
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleSaveConstituency = async () => {
    if (!editingConstituencyName.trim()) {
      toast({ title: 'আসনের নাম লিখুন', variant: 'destructive' });
      return;
    }
    
    setIsSavingConstituency(true);
    const result = await onUpdateConstituency(editingConstituencyName.trim());
    setIsSavingConstituency(false);
    
    if (result.success) {
      toast({ title: 'সফল হয়েছে!', description: 'আসনের নাম সেভ করা হয়েছে' });
    } else {
      toast({ title: 'সমস্যা হয়েছে', description: result.error, variant: 'destructive' });
    }
  };

  const handleAddCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.party_name.trim() || !candidateForm.symbol.trim()) {
      toast({ title: 'সব তথ্য পূরণ করুন', variant: 'destructive' });
      return;
    }
    
    setIsAddingCandidate(true);
    const result = await onAddCandidate({
      ...candidateForm,
      photo_url: candidateForm.photo_url || null,
    });
    setIsAddingCandidate(false);
    
    if (result.success) {
      toast({ title: 'সফল হয়েছে!', description: 'প্রার্থী যোগ করা হয়েছে' });
      setCandidateForm({
        serial_no: candidates.length + 2,
        name: '',
        photo_url: '',
        party_name: '',
        symbol: '',
      });
    } else {
      toast({ title: 'সমস্যা হয়েছে', description: result.error, variant: 'destructive' });
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setEditForm({
      serial_no: candidate.serial_no,
      name: candidate.name,
      photo_url: candidate.photo_url,
      party_name: candidate.party_name,
      symbol: candidate.symbol,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;
    
    const result = await onUpdateCandidate(editingCandidate.id, editForm);
    
    if (result.success) {
      toast({ title: 'সফল হয়েছে!', description: 'প্রার্থী আপডেট করা হয়েছে' });
      setIsEditDialogOpen(false);
      setEditingCandidate(null);
    } else {
      toast({ title: 'সমস্যা হয়েছে', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`"${name}" কে মুছে ফেলতে চান?`)) return;
    
    const result = await onDeleteCandidate(id);
    
    if (result.success) {
      toast({ title: 'মুছে ফেলা হয়েছে', description: 'প্রার্থী সফলভাবে মুছে ফেলা হয়েছে' });
    } else {
      toast({ title: 'সমস্যা হয়েছে', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteAll = async () => {
    const result = await onDeleteAllCandidates();
    
    if (result.success) {
      toast({ title: 'মুছে ফেলা হয়েছে', description: 'সব প্রার্থী মুছে ফেলা হয়েছে' });
      setIsDeleteAllDialogOpen(false);
    } else {
      toast({ title: 'সমস্যা হয়েছে', description: result.error, variant: 'destructive' });
    }
  };

  // Update constituency name when prop changes
  if (constituencyName && editingConstituencyName !== constituencyName && !isSavingConstituency) {
    setEditingConstituencyName(constituencyName);
  }

  return (
    <div className="space-y-6">
      {/* Constituency Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            আসনের নাম
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="আসনের নাম লিখুন (যেমন: ঢাকা-১২)"
              value={editingConstituencyName}
              onChange={(e) => setEditingConstituencyName(e.target.value)}
            />
            <Button onClick={handleSaveConstituency} disabled={isSavingConstituency}>
              <Save className="w-4 h-4 mr-2" />
              সেভ করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Candidate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5" />
            প্রার্থী যোগ করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial">ক্রম নম্বর</Label>
              <Input
                id="serial"
                type="number"
                value={candidateForm.serial_no}
                onChange={(e) => setCandidateForm({ ...candidateForm, serial_no: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">দাখিলকারীর নাম</Label>
              <Input
                id="name"
                placeholder="প্রার্থীর নাম"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party">রাজনৈতিক দল/স্বতন্ত্র</Label>
              <Input
                id="party"
                placeholder="দলের নাম"
                value={candidateForm.party_name}
                onChange={(e) => setCandidateForm({ ...candidateForm, party_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">নির্বাচনী প্রতীক</Label>
              <Input
                id="symbol"
                placeholder="প্রতীকের নাম"
                value={candidateForm.symbol}
                onChange={(e) => setCandidateForm({ ...candidateForm, symbol: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photo">ছবির URL (ঐচ্ছিক)</Label>
              <Input
                id="photo"
                placeholder="https://example.com/photo.jpg"
                value={candidateForm.photo_url || ''}
                onChange={(e) => setCandidateForm({ ...candidateForm, photo_url: e.target.value })}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleAddCandidate} disabled={isAddingCandidate}>
            <Plus className="w-4 h-4 mr-2" />
            প্রার্থী যোগ করুন
          </Button>
        </CardContent>
      </Card>

      {/* Candidates List Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              প্রার্থী তালিকা ({candidates.length})
            </CardTitle>
            {candidates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteAllDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                সব মুছুন
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">লোড হচ্ছে...</p>
          ) : candidates.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">কোনো প্রার্থী যোগ করা হয়নি</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ক্রম</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead className="w-[60px]">ছবি</TableHead>
                    <TableHead>দল</TableHead>
                    <TableHead>প্রতীক</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>{candidate.serial_no}</TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={candidate.photo_url || ''} alt={candidate.name} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{candidate.party_name}</TableCell>
                      <TableCell>{candidate.symbol}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditCandidate(candidate)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রার্থী সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ক্রম নম্বর</Label>
                <Input
                  type="number"
                  value={editForm.serial_no || ''}
                  onChange={(e) => setEditForm({ ...editForm, serial_no: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>নাম</Label>
                <Input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>দল</Label>
                <Input
                  value={editForm.party_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, party_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>প্রতীক</Label>
                <Input
                  value={editForm.symbol || ''}
                  onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ছবির URL</Label>
              <Input
                value={editForm.photo_url || ''}
                onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleSaveEdit}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>সব প্রার্থী মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। সব প্রার্থীর তথ্য মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

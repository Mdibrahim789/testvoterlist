import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Voter, VoterInsert } from '@/types/database';
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
import { useToast } from '@/hooks/use-toast';
import { DataUploadCard } from '@/components/DataUploadCard';
import {
  Vote,
  LogOut,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Users,
  Clock,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, role, signOut, isAdmin, isPendingAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoadingVoters, setIsLoadingVoters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    sl: '',
    voter_no: '',
    name_bn: '',
    father_husband: '',
    dob: '',
    address: '',
    area: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchVoters();
    }
  }, [isAdmin]);

  const fetchVoters = async () => {
    setIsLoadingVoters(true);
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setVoters(data as Voter[] || []);
    } catch (err) {
      console.error('Error fetching voters:', err);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'ভোটার তথ্য লোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingVoters(false);
    }
  };


  const handleEdit = (voter: Voter) => {
    setEditingVoter(voter);
    setFormData({
      sl: voter.sl?.toString() || '',
      voter_no: voter.voter_no,
      name_bn: voter.name_bn,
      father_husband: voter.father_husband || '',
      dob: voter.dob || '',
      address: voter.address || '',
      area: voter.area || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVoter) return;

    try {
      const { error } = await supabase
        .from('voters')
        .update({
          sl: formData.sl ? parseInt(formData.sl) : null,
          voter_no: formData.voter_no,
          name_bn: formData.name_bn,
          father_husband: formData.father_husband || null,
          dob: formData.dob || null,
          address: formData.address || null,
          area: formData.area || null,
        })
        .eq('id', editingVoter.id);

      if (error) throw error;

      toast({
        title: 'সফল হয়েছে!',
        description: 'ভোটার তথ্য আপডেট করা হয়েছে',
      });

      setIsEditDialogOpen(false);
      fetchVoters();
    } catch (err) {
      console.error('Update error:', err);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'তথ্য আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (voter: Voter) => {
    if (!confirm(`"${voter.name_bn}" কে মুছে ফেলতে চান?`)) return;

    try {
      const { error } = await supabase
        .from('voters')
        .delete()
        .eq('id', voter.id);

      if (error) throw error;

      toast({
        title: 'মুছে ফেলা হয়েছে',
        description: 'ভোটার সফলভাবে মুছে ফেলা হয়েছে',
      });

      fetchVoters();
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'মুছে ফেলতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const filteredVoters = voters.filter(
    (v) =>
      v.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voter_no.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  // Show pending message for pending admins
  if (isPendingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vote className="w-8 h-8" />
              <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <Clock className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">অনুমোদনের অপেক্ষায়</h2>
              <p className="text-muted-foreground">
                আপনার অ্যাকাউন্ট এখনও অনুমোদিত হয়নি। একজন অ্যাডমিন আপনাকে অনুমোদন করলে আপনি ড্যাশবোর্ড অ্যাক্সেস করতে পারবেন।
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vote className="w-8 h-8" />
              <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">অ্যাক্সেস নেই</h2>
              <p className="text-muted-foreground">
                আপনার এই পেজ দেখার অনুমতি নেই।
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-8 h-8" />
            <h1 className="text-xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">{user?.email}</span>
            <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats & Upload */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  মোট ভোটার
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{voters.length}</p>
              </CardContent>
            </Card>

            <DataUploadCard onUploadSuccess={fetchVoters} />
          </div>

          {/* Search & Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ভোটার তালিকা
                </CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="নাম বা ভোটার নং দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingVoters ? (
                <p className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</p>
              ) : filteredVoters.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">কোনো ভোটার পাওয়া যায়নি</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ক্রমিক</TableHead>
                        <TableHead>নাম</TableHead>
                        <TableHead>ভোটার নং</TableHead>
                        <TableHead>জন্ম তারিখ</TableHead>
                        <TableHead>এলাকা</TableHead>
                        <TableHead className="text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVoters.map((voter) => (
                        <TableRow key={voter.id}>
                          <TableCell>{voter.sl || '-'}</TableCell>
                          <TableCell className="font-medium">{voter.name_bn}</TableCell>
                          <TableCell>{voter.voter_no}</TableCell>
                          <TableCell>{voter.dob || '-'}</TableCell>
                          <TableCell>{voter.area || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(voter)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(voter)}
                              >
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
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ভোটার তথ্য সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sl">ক্রমিক নং</Label>
                <Input
                  id="edit-sl"
                  value={formData.sl}
                  onChange={(e) => setFormData({ ...formData, sl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-voter-no">ভোটার নং</Label>
                <Input
                  id="edit-voter-no"
                  value={formData.voter_no}
                  onChange={(e) => setFormData({ ...formData, voter_no: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">নাম (বাংলায়)</Label>
              <Input
                id="edit-name"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-father">পিতা/স্বামীর নাম</Label>
              <Input
                id="edit-father"
                value={formData.father_husband}
                onChange={(e) => setFormData({ ...formData, father_husband: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dob">জন্ম তারিখ</Label>
              <Input
                id="edit-dob"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">ঠিকানা</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area">এলাকা</Label>
              <Input
                id="edit-area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleSaveEdit}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

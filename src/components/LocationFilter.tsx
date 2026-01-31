import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Upazila, WardUnion } from '@/types/database';

interface LocationFilterProps {
  upazilas: Upazila[];
  wardsUnions: WardUnion[];
  selectedUpazila: string;
  selectedWardUnion: string;
  onUpazilaChange: (value: string) => void;
  onWardUnionChange: (value: string) => void;
  showAddButtons?: boolean;
  onAddUpazila?: (name: string) => Promise<Upazila>;
  onAddWardUnion?: (name: string, upazilaId: string) => Promise<WardUnion>;
  getWardsForUpazila: (upazilaId: string) => WardUnion[];
  className?: string;
}

export function LocationFilter({
  upazilas,
  wardsUnions,
  selectedUpazila,
  selectedWardUnion,
  onUpazilaChange,
  onWardUnionChange,
  showAddButtons = false,
  onAddUpazila,
  onAddWardUnion,
  getWardsForUpazila,
  className = '',
}: LocationFilterProps) {
  const [isAddUpazilaOpen, setIsAddUpazilaOpen] = useState(false);
  const [isAddWardOpen, setIsAddWardOpen] = useState(false);
  const [newUpazilaName, setNewUpazilaName] = useState('');
  const [newWardName, setNewWardName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredWards = selectedUpazila && selectedUpazila !== 'all'
    ? getWardsForUpazila(selectedUpazila)
    : wardsUnions;

  const handleAddUpazila = async () => {
    if (!newUpazilaName.trim() || !onAddUpazila) return;
    setIsAdding(true);
    try {
      const newUpazila = await onAddUpazila(newUpazilaName.trim());
      onUpazilaChange(newUpazila.id);
      setNewUpazilaName('');
      setIsAddUpazilaOpen(false);
    } catch (err) {
      console.error('Error adding upazila:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddWard = async () => {
    if (!newWardName.trim() || !selectedUpazila || selectedUpazila === 'all' || !onAddWardUnion) return;
    setIsAdding(true);
    try {
      const newWard = await onAddWardUnion(newWardName.trim(), selectedUpazila);
      onWardUnionChange(newWard.id);
      setNewWardName('');
      setIsAddWardOpen(false);
    } catch (err) {
      console.error('Error adding ward/union:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Upazila Select */}
      <div className="flex gap-1">
        <Select value={selectedUpazila} onValueChange={(value) => {
          onUpazilaChange(value);
          onWardUnionChange('all');
        }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="উপজেলা" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব উপজেলা</SelectItem>
            {upazilas.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showAddButtons && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsAddUpazilaOpen(true)}
            title="নতুন উপজেলা যোগ করুন"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Ward/Union Select */}
      <div className="flex gap-1">
        <Select 
          value={selectedWardUnion} 
          onValueChange={onWardUnionChange}
          disabled={!selectedUpazila || selectedUpazila === 'all'}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="ওয়ার্ড/ইউনিয়ন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ওয়ার্ড/ইউনিয়ন</SelectItem>
            {filteredWards.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showAddButtons && selectedUpazila && selectedUpazila !== 'all' && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsAddWardOpen(true)}
            title="নতুন ওয়ার্ড/ইউনিয়ন যোগ করুন"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Add Upazila Dialog */}
      <Dialog open={isAddUpazilaOpen} onOpenChange={setIsAddUpazilaOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>নতুন উপজেলা যোগ করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-upazila">উপজেলার নাম</Label>
              <Input
                id="new-upazila"
                value={newUpazilaName}
                onChange={(e) => setNewUpazilaName(e.target.value)}
                placeholder="যেমন: সাভার"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUpazilaOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleAddUpazila} disabled={isAdding || !newUpazilaName.trim()}>
              {isAdding ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ward/Union Dialog */}
      <Dialog open={isAddWardOpen} onOpenChange={setIsAddWardOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>নতুন ওয়ার্ড/ইউনিয়ন যোগ করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-ward">ওয়ার্ড/ইউনিয়নের নাম</Label>
              <Input
                id="new-ward"
                value={newWardName}
                onChange={(e) => setNewWardName(e.target.value)}
                placeholder="যেমন: ১ নং ওয়ার্ড"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWardOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleAddWard} disabled={isAdding || !newWardName.trim()}>
              {isAdding ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

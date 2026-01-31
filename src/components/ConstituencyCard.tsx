import { MapPin } from 'lucide-react';

interface ConstituencyCardProps {
  name: string | null;
}

export function ConstituencyCard({ name }: ConstituencyCardProps) {
  if (!name) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-primary font-semibold">
        <MapPin className="w-5 h-5" />
        <span className="text-lg">আসন: {name}</span>
      </div>
    </div>
  );
}

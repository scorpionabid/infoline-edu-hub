
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SectorSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
}

export const SectorSelect: React.FC<SectorSelectProps> = ({
  id,
  value,
  onValueChange,
  placeholder = "Sektor seçin"
}) => {
  // Mock data - gerçək implementasiyada Supabase-dən gələcək
  const sectors = [
    { id: '1', name: 'Ümumi Təhsil' },
    { id: '2', name: 'Texniki Təhsil' },
    { id: '3', name: 'Peşə Təhsili' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sectors.map((sector) => (
          <SelectItem key={sector.id} value={sector.id}>
            {sector.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

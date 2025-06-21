
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
}

export const RegionSelect: React.FC<RegionSelectProps> = ({
  id,
  value,
  onValueChange,
  placeholder = "Region seçin"
}) => {
  // Mock data - gerçək implementasiyada Supabase-dən gələcək
  const regions = [
    { id: '1', name: 'Bakı' },
    { id: '2', name: 'Gəncə' },
    { id: '3', name: 'Sumqayıt' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.id}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

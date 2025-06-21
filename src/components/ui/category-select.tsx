
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  id,
  value,
  onValueChange,
  placeholder = "Kateqoriya seçin"
}) => {
  // Mock data - gerçək implementasiyada Supabase-dən gələcək
  const categories = [
    { id: '1', name: 'Ümumi Məlumatlar' },
    { id: '2', name: 'Tədris Prosesi' },
    { id: '3', name: 'İnfrastruktur' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

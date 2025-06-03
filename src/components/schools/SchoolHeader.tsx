
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SchoolHeaderProps {
  onAddClick: () => void;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Məktəblər</h1>
        <p className="text-gray-600">Məktəbləri idarə edin</p>
      </div>
      <Button onClick={onAddClick} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Yeni məktəb</span>
      </Button>
    </div>
  );
};

export default SchoolHeader;

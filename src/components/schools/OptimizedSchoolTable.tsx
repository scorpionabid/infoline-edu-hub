
import React from 'react';
import { School } from '@/types/supabase';
import VirtualTable from '@/components/performance/VirtualTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Link, FileText } from 'lucide-react';

interface OptimizedSchoolTableProps {
  schools: School[];
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onAdmin: (school: School) => void;
  onLinks: (school: School) => void;
  onFiles: (school: School) => void;
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
}

const OptimizedSchoolTable: React.FC<OptimizedSchoolTableProps> = ({
  schools,
  onEdit,
  onDelete,
  onAdmin,
  onLinks,
  onFiles,
  regionNames,
  sectorNames,
}) => {
  const renderSchoolRow = (school: School, index: number) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div>
          <p className="font-medium">{school.name}</p>
          <p className="text-sm text-gray-500">{school.email}</p>
        </div>
        
        <div>
          <p className="text-sm">{regionNames[school.region_id] || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-sm">{sectorNames[school.sector_id] || 'N/A'}</p>
        </div>
        
        <div>
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
            school.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {school.status}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(school)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onAdmin(school)}>
          <User className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onLinks(school)}>
          <Link className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onFiles(school)}>
          <FileText className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(school)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-700">
          <div>Məktəb</div>
          <div>Region</div>
          <div>Sektor</div>
          <div>Status</div>
        </div>
      </div>
      
      {/* Virtual Table */}
      <VirtualTable
        items={schools}
        itemHeight={80}
        height={600}
        renderItem={renderSchoolRow}
        className="w-full"
      />
    </div>
  );
};

export default OptimizedSchoolTable;

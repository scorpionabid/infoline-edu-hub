import React, { memo } from 'react';
import { School } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import VirtualTable, { VirtualItem } from '@/components/performance/VirtualTable';

interface OptimizedSchoolTableProps {
  schools: School[];
  selectedSchools: string[];
  onSchoolSelect: (schoolId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const rowHeight = 60;

export const OptimizedSchoolTable: React.FC<OptimizedSchoolTableProps> = memo(({
  schools,
  selectedSchools,
  onSchoolSelect,
  onSelectAll
}) => {
  const handleSchoolSelect = (schoolId: string, checked: boolean) => {
    onSchoolSelect(schoolId, checked);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const isAllSelected = schools.length > 0 && selectedSchools.length === schools.length;

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded">
        <Checkbox
          id="select-all"
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
        />
        <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Bütün məktəbləri seç ({schools.length} məktəb)
        </Label>
      </div>

      {/* Virtualized School List */}
      <VirtualTable<School>
        items={schools}
        itemHeight={rowHeight}
        height={600}
        renderItem={({ item: school, index }) => (
          <div
            key={school.id}
            className={`
              grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/50 transition-colors
              ${selectedSchools.includes(school.id) ? 'bg-blue-50' : ''}
            `}
          >
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
              <Checkbox
                id={`school-${school.id}`}
                checked={selectedSchools.includes(school.id)}
                onCheckedChange={(checked) => handleSchoolSelect(school.id, checked as boolean)}
              />
            </div>

            {/* School Name */}
            <div className="col-span-3 flex items-center">
              <Label htmlFor={`school-${school.id}`} className="cursor-pointer font-medium">
                {school.name}
              </Label>
            </div>

            {/* Region */}
            <div className="col-span-2 flex items-center text-muted-foreground">
              {school.region?.name || 'Region yoxdur'}
            </div>

            {/* Sector */}
            <div className="col-span-1 flex items-center text-muted-foreground">
              {school.sector?.name || 'Sektor yoxdur'}
            </div>
          </div>
        )}
      />
    </div>
  );
});

import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Square } from 'lucide-react';
import { School } from '@/utils/reports/schoolColumnDataUtils';

interface SchoolSelectionPanelProps {
  schools: School[];
  selectedSchoolIds: string[];
  onSchoolSelect: (schoolId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const SchoolSelectionPanel: React.FC<SchoolSelectionPanelProps> = ({
  schools,
  selectedSchoolIds,
  onSchoolSelect,
  // onSelectAll
}) => {
  if (schools.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Məktəbləri Seçin ({selectedSchoolIds.length}/{schools.length} seçilib):</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(true)}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Hamısını Seç
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(false)}
          >
            <Square className="h-4 w-4 mr-1" />
            Seçimi Təmizlə
          </Button>
        </div>
      </div>
      <div className="mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <div key={school.id} className="flex items-center space-x-2">
              <Checkbox
                id={school.id}
                checked={selectedSchoolIds.includes(school.id)}
                onCheckedChange={(checked) => onSchoolSelect(school.id, checked as boolean)}
              />
              <Label htmlFor={school.id} className="text-sm cursor-pointer flex-1">
                {school.name}
                <span className="text-xs text-muted-foreground ml-1">
                  ({school.sector_name})
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolSelectionPanel;

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { normalizeSearch } from '@/utils/string-utils';

interface School {
  id: string;
  name: string;
  code?: string;
  region_name?: string;
  sector_name?: string;
}

interface SchoolsSelectorProps {
  schools: School[];
  selectedSchoolIds: string[];
  onSchoolsSelect: (schoolIds: string[]) => void;
}

export const SchoolsSelector: React.FC<SchoolsSelectorProps> = ({
  schools,
  selectedSchoolIds,
  onSchoolsSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Axtarış filtri
  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return schools;
    
    // Normallaşdırılmış axtarış - RLS və rol normallaşdırma yanaşmasına uyğun metoddan istifadə
    const normalizedSearch = normalizeSearch(searchTerm);
    
    return schools.filter(school => 
      normalizeSearch(school.name).includes(normalizedSearch) || 
      normalizeSearch(school.code || "").includes(normalizedSearch) ||
      normalizeSearch(school.region_name || "").includes(normalizedSearch) ||
      normalizeSearch(school.sector_name || "").includes(normalizedSearch)
    );
  }, [schools, searchTerm]);

  // Hamısını seç/ləğv et
  const toggleAll = (select: boolean) => {
    if (select) {
      onSchoolsSelect(filteredSchools.map(school => school.id));
    } else {
      onSchoolsSelect([]);
    }
  };

  // Seçilmiş məktəblərin sayı
  const selectedCount = selectedSchoolIds.length;
  const filteredCount = filteredSchools.length;
  
  // Bütün filterlənmiş məktəblər seçilmişdirmi?
  const isAllSelected = filteredCount > 0 && filteredSchools.every(
    school => selectedSchoolIds.includes(school.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Məktəbləri seçin</h3>
      
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Məktəblər üzrə axtar..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAll(true)}
            disabled={filteredSchools.length === 0}
          >
            Hamısını seç
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAll(false)}
            disabled={selectedCount === 0}
          >
            Seçimi təmizlə
          </Button>
        </div>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center space-x-2 text-sm">
          <Badge className="bg-primary">
            {selectedCount} məktəb seçilib
          </Badge>
          {filteredCount !== schools.length && (
            <span className="text-muted-foreground">
              ({filteredCount} məktəb filter edilib)
            </span>
          )}
        </div>
      )}
      
      <div className="h-[400px] overflow-y-auto pr-2 mt-4 border rounded-md p-2">
        {filteredSchools.length > 0 ? (
          <div>
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-2 border-b z-10 mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
                <Label htmlFor="select-all">Bütün göstərilən məktəbləri seç</Label>
              </div>
            </div>
            
            {filteredSchools.map((school) => (
              <div 
                key={school.id} 
                className="flex items-start space-x-2 mb-3 p-3 rounded-md border hover:bg-muted/50"
              >
                <Checkbox 
                  id={`school-${school.id}`} 
                  checked={selectedSchoolIds.includes(school.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSchoolsSelect([...selectedSchoolIds, school.id]);
                    } else {
                      onSchoolsSelect(selectedSchoolIds.filter(id => id !== school.id));
                    }
                  }}
                  className="mt-1" 
                />
                
                <Label 
                  htmlFor={`school-${school.id}`} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">
                    {school.name}
                    {school.code && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({school.code})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                    {school.sector_name && (
                      <span className="inline-flex items-center">
                        Sektor: {school.sector_name}
                      </span>
                    )}
                    {school.region_name && (
                      <span className="inline-flex items-center">
                        Region: {school.region_name}
                      </span>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {schools.length > 0 
              ? 'Axtarış kriteriyalarına uyğun məktəb tapılmadı.'
              : 'Heç bir məktəb tapılmadı.'}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, School, Users, CheckCircle, Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleSchoolSelectorProps {
  schools: Array<{ id: string; name: string; student_count?: number; }>;
  selectedSchoolId: string | null;
  onSchoolSelect: (schoolId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SimpleSchoolSelector: React.FC<SimpleSchoolSelectorProps> = ({
  schools,
  selectedSchoolId,
  onSchoolSelect,
  searchQuery,
  // onSearchChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Simple filtering with performance optimization
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    const query = searchQuery.toLowerCase();
    return schools.filter(school => 
      school.name.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Məktəb seçin</CardTitle>
          <Badge variant="outline">{filteredSchools.length} məktəb</Badge>
        </div>
        
        {/* Enhanced search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Məktəb axtarın..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* View mode toggle - FIX: Added aria-label for accessibility */}
          <div className="flex justify-end">
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none px-2"
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none px-2"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredSchools.length === 0 ? (
          <div className="text-center py-8">
            <School className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Heç bir məktəb tapılmadı</p>
            {searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSearchChange('')}
                className="mt-2"
              >
                Axtarışı təmizlə
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSchools.map((school) => (
                  <Card
                    key={school.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedSchoolId === school.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => onSchoolSelect(school.id)}
                    data-testid={`school-card-${school.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                            {school.name}
                          </h3>
                          {selectedSchoolId === school.id && (
                            <CheckCircle className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
                          )}
                        </div>
                        
                        {school.student_count && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Users className="w-3 h-3 mr-1" />
                            {school.student_count} şagird
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                      selectedSchoolId === school.id 
                        ? "bg-primary/5 border border-primary" 
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                    onClick={() => onSchoolSelect(school.id)}
                    data-testid={`school-item-${school.id}`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <School className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{school.name}</p>
                        {school.student_count && (
                          <p className="text-xs text-gray-500">{school.student_count} şagird</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedSchoolId === school.id && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
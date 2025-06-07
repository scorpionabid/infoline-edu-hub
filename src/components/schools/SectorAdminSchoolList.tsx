
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { School, Search, Building2 } from 'lucide-react';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SchoolDataEntryManager } from '@/components/dataEntry/SchoolDataEntryManager';

interface SectorAdminSchoolListProps {
  onSchoolSelect?: (schoolId: string) => void;
  onDataEntry?: (schoolId: string) => void;
}

export const SectorAdminSchoolList: React.FC<SectorAdminSchoolListProps> = ({
  onSchoolSelect,
  onDataEntry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showDataEntry, setShowDataEntry] = useState(false);
  
  const { schools, loading } = useSchoolsQuery();

  // Filter schools based on search
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchoolSelect = (schoolId: string) => {
    console.log('School selected:', schoolId);
    setSelectedSchoolId(schoolId);
    if (onSchoolSelect) {
      onSchoolSelect(schoolId);
    }
  };

  const handleDataEntryClick = (schoolId: string) => {
    console.log('Data entry button clicked for school:', schoolId);
    setSelectedSchoolId(schoolId);
    setShowDataEntry(true);
    
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  };

  const handleCloseDataEntry = () => {
    console.log('Closing data entry');
    setShowDataEntry(false);
    setSelectedSchoolId(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show data entry form if a school is selected for data entry
  if (showDataEntry && selectedSchoolId) {
    return (
      <div className="h-full">
        <SchoolDataEntryManager
          schoolId={selectedSchoolId}
          onClose={handleCloseDataEntry}
          onComplete={() => {
            console.log('Data entry completed');
            handleCloseDataEntry();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Məktəb Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Məktəb axtarın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <div className="flex-1 overflow-hidden">
        <div className="grid gap-3 h-full overflow-y-auto">
          {filteredSchools.map((school) => (
            <Card 
              key={school.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedSchoolId === school.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => handleSchoolSelect(school.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {school.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {school.completion_rate || 0}% tamamlandı
                    </Badge>
                    {selectedSchoolId === school.id && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click event
                          handleDataEntryClick(school.id);
                        }}
                      >
                        Məlumat Daxil Et
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredSchools.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Heç bir məktəb tapılmadı</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorAdminSchoolList;

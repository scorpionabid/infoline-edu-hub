
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { Building, Search, Users, BarChart3 } from 'lucide-react';

interface School {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  principal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SectorAdminSchoolListProps {
  onSchoolSelect?: (schoolId: string) => void;
  onDataEntry?: (schoolId: string) => void;
  onBulkSelect?: (schoolIds: string[]) => void;
}

export const SectorAdminSchoolList: React.FC<SectorAdminSchoolListProps> = ({
  onSchoolSelect,
  onDataEntry,
  onBulkSelect
}) => {
  const user = useAuthStore(selectUser);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    fetchSchools();
  }, [user?.sector_id]);

  const fetchSchools = async () => {
    if (!user?.sector_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', user.sector_id)
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelection = (schoolId: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedSchools, schoolId]
      : selectedSchools.filter(id => id !== schoolId);
    
    setSelectedSchools(newSelected);
    onBulkSelect?.(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? filteredSchools.map(s => s.id) : [];
    setSelectedSchools(newSelected);
    onBulkSelect?.(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Məktəblər yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Sektor Məktəbləri
            <Badge variant="outline">{filteredSchools.length} məktəb</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Məktəb axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSchools.length === filteredSchools.length && filteredSchools.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Hamısını seç</span>
            </div>
          </div>

          {selectedSchools.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedSchools.length} məktəb seçildi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSchools.includes(school.id)}
                    onCheckedChange={(checked) => handleSchoolSelection(school.id, !!checked)}
                  />
                  <h3 className="font-medium text-sm">{school.name}</h3>
                </div>
                <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                  {school.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {school.principal_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{school.principal_name}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    onSchoolSelect?.(school.id);
                    onDataEntry?.(school.id);
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Məlumat Gir
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onSchoolSelect?.(school.id)}
                >
                  Seç
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Məktəb tapılmadı</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Axtarış nəticəsinə uyğun məktəb yoxdur' : 'Bu sektorda məktəb yoxdur'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SectorAdminSchoolList;

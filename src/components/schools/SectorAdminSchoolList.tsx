import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/common/useDebounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SectorSelect } from '@/components/ui/sector-select';
import { RegionSelect } from '@/components/ui/region-select';
import { CategorySelect } from '@/components/ui/category-select';
import BulkDataEntryDialog from '@/components/dataEntry/BulkDataEntryDialog';

interface School {
  id: string;
  name: string;
  sector_id: string;
  region_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const SectorAdminSchoolList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showDataEntryDialog, setShowDataEntryDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['schools', debouncedSearchTerm, selectedSector, selectedRegion],
    queryFn: async () => {
      let query = supabase
        .from('schools')
        .select('*')
        .ilike('name', `%${debouncedSearchTerm}%`);

      if (selectedSector) {
        query = query.eq('sector_id', selectedSector);
      }

      if (selectedRegion) {
        query = query.eq('region_id', selectedRegion);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setShowDataEntryDialog(true);
  };

  const handleBulkSelect = useCallback((schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        return [...prev, schoolId];
      }
    });
  }, []);

  const isSchoolSelected = useCallback((schoolId: string) => {
    return selectedSchools.includes(schoolId);
  }, [selectedSchools]);

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Məktəblər</h2>
        <Button onClick={() => setShowBulkDialog(true)}>
          Toplu Məlumat Girişi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Axtarış</Label>
          <Input
            type="text"
            id="search"
            placeholder="Məktəb adı ilə axtar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sector">Sektor</Label>
          <SectorSelect
            id="sector"
            value={selectedSector || ''}
            onValueChange={setSelectedSector}
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <RegionSelect
            id="region"
            value={selectedRegion || ''}
            onValueChange={setSelectedRegion}
          />
        </div>
      </div>
      
      {/* Schools Table */}
      <div className="bg-white rounded-lg shadow">
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Seç</TableHead>
                <TableHead>Adı</TableHead>
                <TableHead>Sektor</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Yüklənir...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">
                    Xəta: {error.message}
                  </TableCell>
                </TableRow>
              )}
              {schools?.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSchoolSelected(school.id)}
                      onChange={() => handleBulkSelect(school.id)}
                    />
                  </TableCell>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.sector_id}</TableCell>
                  <TableCell>{school.region_id}</TableCell>
                  <TableCell>{school.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleSchoolSelect(school)}>
                      Məlumat Girişi
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Data Entry Dialog - fixed props */}
      {showDataEntryDialog && selectedSchool && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedSchool.name} - Məlumat Girişi
              </h2>
              {/* Custom data entry content here */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setShowDataEntryDialog(false);
                    setSelectedSchool(null);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Data Entry Dialog - fixed props */}
      <BulkDataEntryDialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        selectedSchools={selectedSchools}
        categoryId={selectedCategory?.id}
        onComplete={() => {
          setShowBulkDialog(false);
          setSelectedSchools([]);
        }}
      />
    </div>
  );
};

export default SectorAdminSchoolList;

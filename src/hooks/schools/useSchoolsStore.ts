
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { Region } from '@/types/region';
import { useEffect } from 'react';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

interface SchoolsState {
  schools: School[];
  filteredSchools: School[];
  currentItems: School[];
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  regions: Region[];
  sectors: { id: string; name: string; region_id: string }[];
  sortConfig: SortConfig;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  userRole?: string;
  
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegionFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSectorFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleStatusFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSort: (key: string) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
  fetchSchools: () => void;
  isOperationComplete: boolean;
  setIsOperationComplete: (value: boolean) => void;
}

export const useSchoolsStore = create<SchoolsState>((set, get) => ({
  schools: [],
  filteredSchools: [],
  currentItems: [],
  searchTerm: '',
  selectedRegion: '',
  selectedSector: '',
  selectedStatus: '',
  regions: [],
  sectors: [],
  sortConfig: { key: null, direction: null },
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  userRole: undefined,
  isOperationComplete: false,
  
  handleSearch: (e) => {
    const term = e.target.value;
    set({ searchTerm: term, currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => 
      school.name.toLowerCase().includes(term.toLowerCase()) ||
      (school.principalName && school.principalName.toLowerCase().includes(term.toLowerCase()))
    );
    set({ filteredSchools: filtered });
    updateCurrentItems(get);
  },
  
  handleRegionFilter: (e) => {
    const regionId = e.target.value;
    set({ selectedRegion: regionId, selectedSector: '', currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.regionId === regionId);
    set({ filteredSchools: filtered });
    updateCurrentItems(get);
  },
  
  handleSectorFilter: (e) => {
    const sectorId = e.target.value;
    set({ selectedSector: sectorId, currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.sectorId === sectorId);
    set({ filteredSchools: filtered });
    updateCurrentItems(get);
  },
  
  handleStatusFilter: (e) => {
    const status = e.target.value;
    set({ selectedStatus: status, currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.status === status);
    set({ filteredSchools: filtered });
    updateCurrentItems(get);
  },
  
  handleSort: (key) => {
    set(state => {
      let direction: 'asc' | 'desc' = 'asc';
      if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      
      const sortedSchools = [...state.filteredSchools].sort((a, b) => {
        // @ts-ignore - Dinamik açar erişimi için
        if (a[key] < b[key]) {
          return direction === 'asc' ? -1 : 1;
        }
        // @ts-ignore - Dinamik açar erişimi için
        if (a[key] > b[key]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      return {
        sortConfig: { key, direction },
        filteredSchools: sortedSchools,
        currentPage: 1
      };
    });
    updateCurrentItems(get);
  },
  
  handlePageChange: (page) => {
    set({ currentPage: page });
    updateCurrentItems(get);
  },
  
  resetFilters: () => {
    set({
      searchTerm: '',
      selectedRegion: '',
      selectedSector: '',
      selectedStatus: '',
      sortConfig: { key: null, direction: null },
      currentPage: 1
    });
    const state = get();
    set({ filteredSchools: state.schools });
    updateCurrentItems(get);
  },
  
  fetchSchools: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) throw schoolsError;
      
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*');
      
      if (regionsError) throw regionsError;
      
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name, region_id');
      
      if (sectorsError) throw sectorsError;
      
      // Supabase'dən gələn məlumatları School tipinə adaptasiya et
      const schools = schoolsData.map((school: any) => {
        // school obyektini olduğu kimi istifadə et, adaptSchoolFromSupabase ilə çevir
        return {
          id: school.id,
          name: school.name,
          principalName: school.principal_name,
          address: school.address,
          regionId: school.region_id,
          sectorId: school.sector_id,
          phone: school.phone,
          email: school.email,
          studentCount: school.student_count,
          teacherCount: school.teacher_count,
          status: school.status || 'active',
          type: school.type,
          language: school.language,
          adminEmail: school.admin_email,

          // Supabase adlandırması üçün
          principal_name: school.principal_name,
          region_id: school.region_id,
          sector_id: school.sector_id,
          student_count: school.student_count,
          teacher_count: school.teacher_count,
          admin_email: school.admin_email
        };
      });
      
      set({ 
        schools,
        filteredSchools: schools,
        regions: regionsData,
        sectors: sectorsData,
        isLoading: false 
      });
      
      updateCurrentItems(get);
      
    } catch (error) {
      console.error('Məktəbləri əldə edərkən xəta:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Bilinməyən xəta' 
      });
    }
  },
  
  setIsOperationComplete: (value) => set({ isOperationComplete: value }),
}));

// Köməkçi funksiya - ümumi istifadə üçün
function updateCurrentItems(get: () => SchoolsState) {
  const state = get();
  const itemsPerPage = 10;
  const startIndex = (state.currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = state.filteredSchools.slice(startIndex, endIndex);
  const totalPages = Math.ceil(state.filteredSchools.length / itemsPerPage);
  
  get().setIsOperationComplete(false); // Əməliyyatı tamamla
}

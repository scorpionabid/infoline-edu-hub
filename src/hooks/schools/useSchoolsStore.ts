import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/data/schoolsData';
import { useEffect } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { adaptSchoolFromSupabase, School as SupabaseSchool } from '@/types/supabase';
import { convertToSchoolType } from './schoolTypeConverters';

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
  regions: { id: string; name: string }[];
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
    get().updateCurrentItems();
  },
  
  handleRegionFilter: (e) => {
    const regionId = e.target.value;
    set({ selectedRegion: regionId, selectedSector: '', currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.regionId === regionId);
    set({ filteredSchools: filtered });
    get().updateCurrentItems();
  },
  
  handleSectorFilter: (e) => {
    const sectorId = e.target.value;
    set({ selectedSector: sectorId, currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.sectorId === sectorId);
    set({ filteredSchools: filtered });
    get().updateCurrentItems();
  },
  
  handleStatusFilter: (e) => {
    const status = e.target.value;
    set({ selectedStatus: status, currentPage: 1 });
    const state = get();
    const filtered = state.schools.filter(school => school.status === status);
    set({ filteredSchools: filtered });
    get().updateCurrentItems();
  },
  
  handleSort: (key) => {
    set(state => {
      let direction = 'asc';
      if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      
      const sortedSchools = [...state.filteredSchools].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === 'asc' ? -1 : 1;
        }
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
    get().updateCurrentItems();
  },
  
  handlePageChange: (page) => {
    set({ currentPage: page });
    get().updateCurrentItems();
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
    get().updateCurrentItems();
  },
  
  updateCurrentItems: () => {
    const state = get();
    const itemsPerPage = 10;
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = state.filteredSchools.slice(startIndex, endIndex);
    const totalPages = Math.ceil(state.filteredSchools.length / itemsPerPage);
    
    set({ currentItems: currentItems, totalPages: totalPages });
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
        .select('id, name');
      
      if (regionsError) throw regionsError;
      
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name, region_id');
      
      if (sectorsError) throw sectorsError;
      
      const schools = schoolsData.map((school: any) => convertToSchoolType(school));
      
      set({ 
        schools: schools,
        filteredSchools: schools,
        regions: regionsData,
        sectors: sectorsData,
        isLoading: false 
      });
      
      get().updateCurrentItems();
      
    } catch (error) {
      console.error('Məktəbləri əldə edərkən xəta:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Bilinməyən xəta' 
      });
    }
  },
  
  useEffect: () => {
    get().fetchSchools();
  },
  
  setIsOperationComplete: (value) => set({ isOperationComplete: value }),
}));

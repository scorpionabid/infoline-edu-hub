import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '@/integrations/supabase/client';

export const useRegionsStore = defineStore('regions', () => {
  const regions = ref<Array<{ id: string, name: string, status: string }>>([]);
  const sectors = ref<Array<{ id: string, name: string, region_id: string, admin_id: string | null, status: string }>>([]);
  const schools = ref<Array<{ id: string, name: string, region_id: string, sector_id: string, type: string, address: string | null, admin_id: string | null, status: string }>>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedRegion = ref('');
  
  const fetchRegions = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: regionsError } = await supabase
        .from('regions')
        .select('*');
      
      if (regionsError) {
        error.value = regionsError.message;
        return;
      }
      
      if (data) {
        regions.value = data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchSectors = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: sectorsError } = await supabase
        .from('sectors')
        .select('*');
      
      if (sectorsError) {
        error.value = sectorsError.message;
        return;
      }
      
      if (data) {
        sectors.value = data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchSchools = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) {
        error.value = schoolsError.message;
        return;
      }
      
      if (data) {
        schools.value = data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const setSelectedRegion = (regionId: string) => {
    selectedRegion.value = regionId;
  };
  
  const filteredSectors = computed(() => {
    if (!selectedRegion.value) return [];
    
    return sectors.value
      .filter(sector => sector.region_id === selectedRegion.value)
      .map(sector => ({
        id: sector.id,
        name: sector.name,
        region_id: sector.region_id,
        admin_id: sector.admin_id,
        status: sector.status
      }));
  });
  
  const filteredSchools = computed(() => {
    if (!selectedRegion.value) return [];
    
    return schools.value.filter(school => school.region_id === selectedRegion.value);
  });
  
  return {
    regions,
    sectors,
    schools,
    loading,
    error,
    selectedRegion,
    fetchRegions,
    fetchSectors,
    fetchSchools,
    setSelectedRegion,
    filteredSectors,
    filteredSchools
  };
});


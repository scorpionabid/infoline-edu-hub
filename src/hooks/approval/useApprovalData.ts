import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface ApprovalData {
  schools: any[];
  regions: any[];
  sectors: any[];
  categories: any[];
}

export const useApprovalData = () => {
  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Helper functions to fetch data
  const fetchSchools = async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, region_id, sector_id');
    if (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
    return data;
  };

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');
    if (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
    return data;
  };

  const fetchSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, region_id');
    if (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }
    return data;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, type');
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    return data;
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schools, regions, sectors, categories] = await Promise.all([
        fetchSchools(),
        fetchRegions(),
        fetchSectors(),
        fetchCategories(),
      ]);

      setData({
        schools,
        regions,
        sectors,
        categories,
      });
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fix the functions that work with arrays
const getItemsById = (items: any[], ids: string[]): any[] => {
  return items.filter(item => ids.includes(item.id));
};

const getFilteredSchools = (schools: any[], regionId?: string, sectorId?: string): any[] => {
  if (!schools || schools.length === 0) return [];
  
  let filteredSchools = [...schools];
  
  if (regionId) {
    filteredSchools = filteredSchools.filter(school => school.region_id === regionId);
  }
  
  if (sectorId) {
    filteredSchools = filteredSchools.filter(school => school.sector_id === sectorId);
  }
  
  return filteredSchools;
};

  const getFilteredRegions = (regions: any[], schoolId?: string): any[] => {
    if (!regions || regions.length === 0) return [];
    if (!schoolId) return regions;
    
    return regions.filter(region => region.id === schoolId);
  };

  const getFilteredSectors = (sectors: any[], regionId?: string): any[] => {
    if (!sectors || sectors.length === 0) return [];
    if (!regionId) return sectors;
    
    return sectors.filter(sector => sector.region_id === regionId);
  };

  const getCategoriesByType = (categories: any[], type?: string): any[] => {
    if (!categories || categories.length === 0) return [];
    if (!type) return categories;
    
    return categories.filter(category => category.type === type);
  };

  // Fix the mapEntities function
const mapEntities = (data: any) => {
  if (!data) return {};
  
  const schools = Array.isArray(data.schools) ? data.schools : [];
  const regions = Array.isArray(data.regions) ? data.regions : [];
  const sectors = Array.isArray(data.sectors) ? data.sectors : [];
  
  const schoolsById = schools.reduce((acc: Record<string, any>, school: any) => {
    acc[school.id] = school;
    return acc;
  }, {});
  
  const regionsById = regions.reduce((acc: Record<string, any>, region: any) => {
    acc[region.id] = region;
    return acc;
  }, {});
  
  const sectorsById = sectors.reduce((acc: Record<string, any>, sector: any) => {
    acc[sector.id] = sector;
    return acc;
  }, {});
  
  return {
    schoolsById,
    regionsById,
    sectorsById,
    regionId: regions.length > 0 ? regions[0].id : null,
    sectorId: sectors.length > 0 ? sectors[0].id : null
  };
};

  return {
    data,
    loading,
    error,
    getItemsById,
    getFilteredSchools,
    getFilteredRegions,
    getFilteredSectors,
    getCategoriesByType,
    mapEntities,
  };
};

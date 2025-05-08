
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './auth';
import { useLanguageSafe } from './LanguageContext';

interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  status?: string;
  logo?: string;
  language?: string;
  completion_rate?: number;
  admin_id?: string;
  admin_email?: string;
  region_name?: string;
  sector_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolsContextType {
  schools: School[];
  loading: boolean;
  error: Error | null;
  addSchool: (school: Omit<School, 'id'>) => Promise<School>;
  updateSchool: (id: string, school: Partial<School>) => Promise<School>;
  deleteSchool: (id: string) => Promise<void>;
  getSchool: (id: string) => School | undefined;
  refetchSchools: () => Promise<void>;
  getSchoolsByRegion: (regionId: string) => School[];
  getSchoolsBySector: (sectorId: string) => School[];
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export const useSchools = () => {
  const context = useContext(SchoolsContext);
  if (!context) {
    throw new Error('useSchools must be used within a SchoolsProvider');
  }
  return context;
};

export const SchoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { t } = useLanguageSafe();

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          regions (name),
          sectors (name)
        `)
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      
      const processedData = data?.map(school => ({
        ...school,
        region_name: school.regions?.name,
        sector_name: school.sectors?.name
      }));
      
      setSchools(processedData || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(err as Error);
      toast.error(t('errorFetchingSchools'));
    } finally {
      setLoading(false);
    }
  };

  const addSchool = async (school: Omit<School, 'id'>): Promise<School> => {
    try {
      setLoading(true);
      setError(null);
      
      const newSchool = {
        name: school.name, // Required property
        region_id: school.region_id, // Required property
        sector_id: school.sector_id, // Required property
        address: school.address || '',
        email: school.email || '',
        phone: school.phone || '',
        principal_name: school.principal_name || '',
        status: school.status || 'active',
        logo: school.logo || '',
        language: school.language || '',
        admin_id: school.admin_id || null,
        admin_email: school.admin_email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('schools')
        .insert(newSchool)
        .select()
        .single();
        
      if (error) throw error;
      
      setSchools(prev => [...prev, data]);
      toast.success(t('schoolAdded'));
      
      return data;
    } catch (err) {
      console.error('Error adding school:', err);
      setError(err as Error);
      toast.error(t('errorAddingSchool'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (id: string, school: Partial<School>): Promise<School> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedSchool = {
        ...school,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('schools')
        .update(updatedSchool)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      toast.success(t('schoolUpdated'));
      
      return data;
    } catch (err) {
      console.error('Error updating school:', err);
      setError(err as Error);
      toast.error(t('errorUpdatingSchool'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('schools')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      setSchools(prev => prev.filter(s => s.id !== id));
      toast.success(t('schoolDeleted'));
    } catch (err) {
      console.error('Error deleting school:', err);
      setError(err as Error);
      toast.error(t('errorDeletingSchool'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSchool = (id: string): School | undefined => {
    return schools.find(s => s.id === id);
  };

  const getSchoolsByRegion = (regionId: string): School[] => {
    return schools.filter(s => s.region_id === regionId);
  };

  const getSchoolsBySector = (sectorId: string): School[] => {
    return schools.filter(s => s.sector_id === sectorId);
  };

  const refetchSchools = async (): Promise<void> => {
    await fetchSchools();
  };

  useEffect(() => {
    if (user) {
      fetchSchools();
    }
  }, [user]);

  const value: SchoolsContextType = {
    schools,
    loading,
    error,
    addSchool,
    updateSchool,
    deleteSchool,
    getSchool,
    refetchSchools,
    getSchoolsByRegion,
    getSchoolsBySector
  };

  return <SchoolsContext.Provider value={value}>{children}</SchoolsContext.Provider>;
};

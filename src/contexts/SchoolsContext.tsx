/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface SchoolsContextType {
  schools: School[];
  regions: any[];
  sectors: any[];
  loading: boolean;
  error: string | null;
  refreshSchools: () => void;
  deleteSchool: (id: string) => Promise<void>;
  updateSchool: (id: string, updates: Partial<School>) => Promise<void>;
  addSchool: (school: Omit<School, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export const useSchools = () => {
  const context = useContext(SchoolsContext);
  if (context === undefined) {
    throw new Error('useSchools must be used within a SchoolsProvider');
  }
  return context;
};

interface SchoolsProviderProps {
  children: ReactNode;
}

export const SchoolsProvider: React.FC<SchoolsProviderProps> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore(selectUser);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setSectors(data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchSchools = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('schools')
        .select(`
          *,
          regions!inner(
            id,
            // name
          ),
          sectors!inner(
            id,
            // name
          )
        `);

      // Apply role-based filtering
      if (user.role === 'regionadmin' && user.region_id) {
        query = query.eq('region_id', user.region_id);
      } else if (user.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('sector_id', user.sector_id);
      } else if (user.role === 'schooladmin' && user.school_id) {
        query = query.eq('id', user.school_id);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      const processedSchools: School[] = data?.map((school: any) => ({
        id: school.id,
        name: school.name,
        principal_name: school.principal_name,
        address: school.address,
        region_id: school.region_id,
        sector_id: school.sector_id,
        phone: school.phone,
        email: school.email,
        student_count: school.student_count || 0, // Convert to number
        teacher_count: school.teacher_count || 0, // Convert to number
        status: school.status,
        type: school.type,
        language: school.language,
        created_at: school.created_at,
        updated_at: school.updated_at,
        completion_rate: school.completion_rate || 0,
        logo: school.logo,
        admin_email: school.admin_email,
        admin_id: school.admin_id,
        region_name: school.regions?.name || '',
        sector_name: school.sectors?.name || ''
      })) || [];
      
      setSchools(processedSchools);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchools = () => {
    fetchSchools();
  };

  const deleteSchool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSchools(prev => prev.filter(school => school.id !== id));
    } catch (err) {
      console.error('Error deleting school:', err);
      throw err;
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: updates.name,
          principal_name: updates.principal_name,
          address: updates.address,
          region_id: updates.region_id,
          sector_id: updates.sector_id,
          phone: updates.phone,
          email: updates.email,
          student_count: updates.student_count ? Number(updates.student_count) : null,
          teacher_count: updates.teacher_count ? Number(updates.teacher_count) : null,
          status: updates.status,
          type: updates.type,
          language: updates.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setSchools(prev => prev.map(school => 
        school.id === id ? { ...school, ...updates } : school
      ));
    } catch (err) {
      console.error('Error updating school:', err);
      throw err;
    }
  };

  const addSchool = async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          principal_name: schoolData.principal_name,
          address: schoolData.address,
          region_id: schoolData.region_id,
          sector_id: schoolData.sector_id,
          phone: schoolData.phone,
          email: schoolData.email,
          student_count: schoolData.student_count ? Number(schoolData.student_count) : null,
          teacher_count: schoolData.teacher_count ? Number(schoolData.teacher_count) : null,
          status: schoolData.status,
          type: schoolData.type,
          language: schoolData.language
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSchool: School = {
        ...schoolData,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        student_count: data.student_count || 0,
        teacher_count: data.teacher_count || 0
      };
      
      setSchools(prev => [...prev, newSchool]);
    } catch (err) {
      console.error('Error adding school:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchSectors();
    fetchSchools();
  }, [user]);

  const value: SchoolsContextType = {
    schools,
    regions,
    sectors,
    loading,
    error,
    refreshSchools,
    deleteSchool,
    updateSchool,
    // addSchool
  };

  return (
    <SchoolsContext.Provider value={value}>
      {children}
    </SchoolsContext.Provider>
  );
};

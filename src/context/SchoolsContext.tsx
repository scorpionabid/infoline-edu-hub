
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { School, SchoolStatus } from '@/types/school';
import { toast } from 'sonner';

export interface CreateSchoolData {
  name: string;
  sector_id: string;
  region_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status: SchoolStatus;
  language?: string;
}

interface SchoolsContextProps {
  schools: School[];
  isLoading: boolean;
  error: string;
  fetchSchools: (regionId?: string, sectorId?: string) => Promise<void>;
  createSchool: (schoolData: CreateSchoolData) => Promise<void>;
  updateSchool: (schoolId: string, schoolData: Partial<School>) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  assignAdmin: (schoolId: string, adminData: any) => Promise<void>;
  refreshSchools: () => Promise<void>;
}

const SchoolsContext = createContext<SchoolsContextProps | undefined>(undefined);

export const useSchoolsContext = () => {
  const context = useContext(SchoolsContext);
  if (!context) {
    throw new Error('useSchoolsContext must be used within a SchoolsProvider');
  }
  return context;
};

interface SchoolsProviderProps {
  children: React.ReactNode;
}

export const SchoolsProvider: React.FC<SchoolsProviderProps> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore(selectUser);

  const fetchSchools = async (regionId?: string, sectorId?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      let query = supabase
        .from('schools')
        .select(`
          *,
          regions(id, name),
          sectors(id, name)
        `);

      // Apply filters based on user role and parameters
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('sector_id', user.sector_id);
      } else if (user?.role === 'schooladmin' && user.school_id) {
        query = query.eq('id', user.school_id);
      }

      // Apply additional filters
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const processedSchools: School[] = data?.map((school: any) => ({
        id: school.id,
        name: school.name,
        region_id: school.region_id,
        sector_id: school.sector_id,
        address: school.address,
        phone: school.phone,
        email: school.email,
        principal_name: school.principal_name,
        student_count: school.student_count,
        teacher_count: school.teacher_count,
        type: school.type,
        status: school.status as SchoolStatus,
        language: school.language,
        logo: school.logo,
        completion_rate: school.completion_rate,
        admin_id: school.admin_id,
        admin_email: school.admin_email,
        created_at: school.created_at,
        updated_at: school.updated_at
      })) || [];

      setSchools(processedSchools);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Məktəblər yüklənərkən xəta baş verdi');
      toast.error('Məktəblər yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const createSchool = async (schoolData: CreateSchoolData) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          sector_id: schoolData.sector_id,
          region_id: schoolData.region_id,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          principal_name: schoolData.principal_name,
          student_count: schoolData.student_count,
          teacher_count: schoolData.teacher_count,
          type: schoolData.type,
          status: schoolData.status,
          language: schoolData.language || 'az'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Məktəb uğurla yaradıldı');
      await fetchSchools();
    } catch (err: any) {
      console.error('Error creating school:', err);
      toast.error('Məktəb yaradılarkən xəta baş verdi');
      throw err;
    }
  };

  const updateSchool = async (schoolId: string, schoolData: Partial<School>) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', schoolId);

      if (error) throw error;

      toast.success('Məktəb məlumatları yeniləndi');
      await fetchSchools();
    } catch (err: any) {
      console.error('Error updating school:', err);
      toast.error('Məktəb yenilənərkən xəta baş verdi');
      throw err;
    }
  };

  const deleteSchool = async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      toast.success('Məktəb silindi');
      await fetchSchools();
    } catch (err: any) {
      console.error('Error deleting school:', err);
      toast.error('Məktəb silinərkən xəta baş verdi');
      throw err;
    }
  };

  const assignAdmin = async (schoolId: string, adminData: any) => {
    try {
      // Call the assign_school_admin function with proper parameter names
      const { data, error } = await supabase
        .rpc('assign_school_admin', {
          user_id_param: adminData.userId,
          school_id_param: schoolId
        });

      if (error) throw error;

      // Check if the result is a JSON object with success/error properties
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          throw new Error(data.error || 'Admin təyin edilərkən xəta baş verdi');
        }
      }

      toast.success('Məktəb admini uğurla təyin edildi');
      await fetchSchools();
    } catch (err: any) {
      console.error('Error assigning admin:', err);
      toast.error(err.message || 'Admin təyin edilərkən xəta baş verdi');
      throw err;
    }
  };

  const refreshSchools = async () => {
    await fetchSchools();
  };

  useEffect(() => {
    if (user) {
      fetchSchools();
    }
  }, [user]);

  return (
    <SchoolsContext.Provider
      value={{
        schools,
        isLoading,
        error,
        fetchSchools,
        createSchool,
        updateSchool,
        deleteSchool,
        assignAdmin,
        refreshSchools
      }}
    >
      {children}
    </SchoolsContext.Provider>
  );
};

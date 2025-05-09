import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { School } from '@/types/school';
import { FullUserData } from '@/types/auth';
import { useAuth } from '@/context/auth';

interface SchoolsContextProps {
  schools: School[];
  isLoading: boolean;
  error: string | null;
  fetchSchools: (regionId?: string, sectorId?: string) => Promise<void>;
  createSchool: (schoolData: Omit<School, 'id'>) => Promise<void>;
  updateSchool: (schoolId: string, schoolData: Partial<School>) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  assignSchoolAdmin: (schoolId: string, userId: string) => Promise<void>;
  bulkCreateSchools: (schoolsData: Partial<School>[]) => Promise<void>;
}

const SchoolsContext = createContext<SchoolsContextProps | undefined>(undefined);

export const useSchoolsContext = () => {
  const context = useContext(SchoolsContext);
  if (!context) {
    throw new Error('useSchoolsContext must be used within a SchoolsProvider');
  }
  return context;
};

export const SchoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSchools = async (regionId?: string, sectorId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('schools').select('*');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSchools(data as School[]);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to load schools: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSchool = async (schoolData: Omit<School, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw error;

      setSchools((prev) => [...prev, data as School]);
      
      toast.success('Success', {
        description: 'School created successfully'
      });
    } catch (err: any) {
      console.error('Error creating school:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to create school: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchool = async (schoolId: string, schoolData: Partial<School>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', schoolId)
        .select()
        .single();

      if (error) throw error;

      setSchools((prev) =>
        prev.map((school) => (school.id === schoolId ? { ...school, ...data } : school))
      );
      
      toast.success('Success', {
        description: 'School updated successfully'
      });
    } catch (err: any) {
      console.error('Error updating school:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to update school: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchool = async (schoolId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      setSchools((prev) => prev.filter((school) => school.id !== schoolId));
      
      toast.success('Success', {
        description: 'School deleted successfully'
      });
    } catch (err: any) {
      console.error('Error deleting school:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to delete school: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignSchoolAdmin = async (schoolId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get school data to get region_id and sector_id
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();
    
      if (schoolError) throw schoolError;
      
      if (!schoolData || !schoolData.region_id || !schoolData.sector_id) {
        throw new Error('School data missing required fields');
      }

      // First, update the user_roles table
      const { error: rolesError } = await supabase.rpc('assign_school_admin', {
        user_id: userId,
        school_id: schoolId,
        region_id: schoolData.region_id,
        sector_id: schoolData.sector_id
      });
      
      if (rolesError) throw rolesError;

      // Then update the schools table
      const { error: schoolError2 } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);
      
      if (schoolError2) throw schoolError2;
      
      toast.success('Success', {
        description: 'School admin assigned successfully'
      });
      
      await fetchSchools();
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to assign school admin: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bulkCreateSchools = async (schoolsData: Partial<School>[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure required fields are present
      const validSchoolsData = schoolsData.filter(school => 
        school.name && school.region_id && school.sector_id
      );
      
      if (validSchoolsData.length === 0) {
        throw new Error('No valid school data provided');
      }
      
      // Insert schools one by one to avoid type errors
      for (const schoolData of validSchoolsData) {
        // Ensure we have the name field
        if (schoolData.name) {
          const { error } = await supabase
            .from('schools')
            .insert({
              name: schoolData.name,
              region_id: schoolData.region_id,
              sector_id: schoolData.sector_id,
              address: schoolData.address,
              phone: schoolData.phone,
              email: schoolData.email,
              principal_name: schoolData.principal_name,
              student_count: schoolData.student_count,
              teacher_count: schoolData.teacher_count,
              type: schoolData.type,
              status: schoolData.status || 'active',
              language: schoolData.language
            });
          
          if (error) throw error;
        }
      }
      
      toast.success('Success', {
        description: `${validSchoolsData.length} schools created successfully`
      });
      
      await fetchSchools();
    } catch (err: any) {
      console.error('Error creating schools in bulk:', err);
      setError(err.message);
      toast.error('Error', {
        description: `Failed to create schools: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    schools,
    isLoading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    assignSchoolAdmin,
    bulkCreateSchools,
  };

  return <SchoolsContext.Provider value={value}>{children}</SchoolsContext.Provider>;
};

export default SchoolsContext;

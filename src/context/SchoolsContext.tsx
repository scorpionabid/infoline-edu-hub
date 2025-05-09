
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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

export const SchoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
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
      toast({
        title: 'Error',
        description: `Failed to load schools: ${err.message}`,
        variant: 'destructive',
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
      
      toast({
        title: 'Success',
        description: 'School created successfully',
      });
    } catch (err: any) {
      console.error('Error creating school:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to create school: ${err.message}`,
        variant: 'destructive',
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
      
      toast({
        title: 'Success',
        description: 'School updated successfully',
      });
    } catch (err: any) {
      console.error('Error updating school:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to update school: ${err.message}`,
        variant: 'destructive',
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
      
      toast({
        title: 'Success',
        description: 'School deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting school:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to delete school: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignSchoolAdmin = async (schoolId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, update the user_roles table
      const { error: rolesError } = await supabase.rpc('assign_school_admin', {
        p_user_id: userId,
        p_school_id: schoolId
      });
      
      if (rolesError) throw rolesError;

      // Then update the schools table
      const { error: schoolError } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);
      
      if (schoolError) throw schoolError;
      
      toast({
        title: 'Success',
        description: 'School admin assigned successfully',
      });
      
      await fetchSchools();
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to assign school admin: ${err.message}`,
        variant: 'destructive',
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
        const { error } = await supabase
          .from('schools')
          .insert(schoolData);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: `${validSchoolsData.length} schools created successfully`,
      });
      
      await fetchSchools();
    } catch (err: any) {
      console.error('Error creating schools in bulk:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to create schools: ${err.message}`,
        variant: 'destructive',
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

export const useSchools = () => {
  const context = useContext(SchoolsContext);
  if (!context) {
    throw new Error('useSchools must be used within a SchoolsProvider');
  }
  return context;
};

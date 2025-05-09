
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { toast } from 'sonner';

export interface SchoolsContextType {
  schools: School[];
  loading: boolean;
  error: string | null;
  fetchSchools: () => Promise<void>;
  handleCreateSchool: (schoolData: Partial<School>) => Promise<void>;
  handleUpdateSchool: (school: School) => Promise<void>;
  handleDeleteSchool: (schoolId: string) => Promise<void>;
  handleAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export const SchoolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setSchools(data || []);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Error fetching schools');
      toast.error(err.message || 'Error fetching schools');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (schoolData: Partial<School>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();
      
      if (error) throw error;
      
      setSchools(prev => [...prev, data]);
      toast.success('School created successfully');
    } catch (err: any) {
      console.error('Error creating school:', err);
      setError(err.message || 'Error creating school');
      toast.error(err.message || 'Error creating school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (school: School) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('schools')
        .update(school)
        .eq('id', school.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSchools(prev => prev.map(s => s.id === school.id ? data : s));
      toast.success('School updated successfully');
    } catch (err: any) {
      console.error('Error updating school:', err);
      setError(err.message || 'Error updating school');
      toast.error(err.message || 'Error updating school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (error) throw error;
      
      setSchools(prev => prev.filter(s => s.id !== schoolId));
      toast.success('School deleted successfully');
    } catch (err: any) {
      console.error('Error deleting school:', err);
      setError(err.message || 'Error deleting school');
      toast.error(err.message || 'Error deleting school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.rpc('assign_school_admin', {
        user_id_param: userId,
        school_id_param: schoolId
      });
      
      if (error) throw error;
      
      // Update the school list with the new admin
      await fetchSchools();
      toast.success('Admin assigned successfully');
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message || 'Error assigning school admin');
      toast.error(err.message || 'Error assigning school admin');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    schools,
    loading,
    error,
    fetchSchools,
    handleCreateSchool,
    handleUpdateSchool,
    handleDeleteSchool,
    handleAssignAdmin
  }), [schools, loading, error]);

  return (
    <SchoolsContext.Provider value={contextValue}>
      {children}
    </SchoolsContext.Provider>
  );
};

export const useSchoolsContext = () => {
  const context = useContext(SchoolsContext);
  if (context === undefined) {
    throw new Error('useSchoolsContext must be used within a SchoolsProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, Region, Sector } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface SchoolsContextType {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  loading: {
    schools: boolean;
    regions: boolean;
    sectors: boolean;
  };
  error: string | null;
  refreshSchools: () => Promise<void>;
  handleCreateSchool: (schoolData: Partial<School>) => Promise<void>;
  handleUpdateSchool: (schoolId: string, schoolData: Partial<School>) => Promise<void>;
  handleDeleteSchool: (schoolId: string) => Promise<void>;
  handleAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  selectedSchool: School | null;
  selectedAdmin: School | null;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAdminDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSchool: React.Dispatch<React.SetStateAction<School | null>>;
  setSelectedAdmin: React.Dispatch<React.SetStateAction<School | null>>;
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
}

const SchoolsContext = createContext<SchoolsContextType | undefined>(undefined);

export const SchoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { userRole, regionId, sectorId } = usePermissions();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState({
    schools: true,
    regions: false,
    sectors: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  
  // Convert region and sector IDs to names for display
  const [regionNames, setRegionNames] = useState<{ [key: string]: string }>({});
  const [sectorNames, setSectorNames] = useState<{ [key: string]: string }>({});
  
  // Fetch schools
  const fetchSchools = async () => {
    setLoading(prev => ({ ...prev, schools: true }));
    setError(null);
    
    try {
      let query = supabase
        .from('schools')
        .select('*');
      
      // Filter based on user role
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSchools(data || []);
      
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message);
      toast.error('Məktəbləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(prev => ({ ...prev, schools: false }));
    }
  };
  
  // Fetch regions
  const fetchRegions = async () => {
    setLoading(prev => ({ ...prev, regions: true }));
    
    try {
      let query = supabase
        .from('regions')
        .select('*');
      
      // Filter based on user role
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('id', regionId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setRegions(data || []);
      
      // Create a map of region IDs to names
      const namesMap: { [key: string]: string } = {};
      data?.forEach(region => {
        namesMap[region.id] = region.name;
      });
      setRegionNames(namesMap);
      
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      // Don't show toast for regions, as it's not the primary data
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };
  
  // Fetch sectors
  const fetchSectors = async () => {
    setLoading(prev => ({ ...prev, sectors: true }));
    
    try {
      let query = supabase
        .from('sectors')
        .select('*');
      
      // Filter based on user role
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('id', sectorId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSectors(data || []);
      
      // Create a map of sector IDs to names
      const namesMap: { [key: string]: string } = {};
      data?.forEach(sector => {
        namesMap[sector.id] = sector.name;
      });
      setSectorNames(namesMap);
      
    } catch (err: any) {
      console.error('Error fetching sectors:', err);
      // Don't show toast for sectors, as it's not the primary data
    } finally {
      setLoading(prev => ({ ...prev, sectors: false }));
    }
  };
  
  // Refresh all data
  const refreshSchools = async () => {
    await Promise.all([
      fetchSchools(),
      fetchRegions(),
      fetchSectors()
    ]);
  };
  
  // Create school
  const handleCreateSchool = async (schoolData: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({ ...schoolData })
        .select()
        .single();
      
      if (error) throw error;
      
      setSchools(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error('Error creating school:', err);
      throw err;
    }
  };
  
  // Update school
  const handleUpdateSchool = async (schoolId: string, schoolData: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', schoolId)
        .select()
        .single();
      
      if (error) throw error;
      
      setSchools(prev => 
        prev.map(school => school.id === schoolId ? data : school)
      );
      return data;
    } catch (err: any) {
      console.error('Error updating school:', err);
      throw err;
    }
  };
  
  // Delete school
  const handleDeleteSchool = async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (error) throw error;
      
      setSchools(prev => prev.filter(school => school.id !== schoolId));
    } catch (err: any) {
      console.error('Error deleting school:', err);
      throw err;
    }
  };
  
  // Assign admin to school
  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    try {
      // Update user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          role: 'schooladmin',
          school_id: schoolId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (roleError) throw roleError;
      
      // Update school table
      const { error: schoolError } = await supabase
        .from('schools')
        .update({ 
          admin_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId);
      
      if (schoolError) throw schoolError;
      
      // Get user email for admin_email field
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      if (userData?.email) {
        const { error: updateEmailError } = await supabase
          .from('schools')
          .update({ admin_email: userData.email })
          .eq('id', schoolId);
        
        if (updateEmailError) console.error('Error updating admin_email:', updateEmailError);
      }
      
      // Update local state
      await fetchSchools();
    } catch (err: any) {
      console.error('Error assigning admin:', err);
      throw err;
    }
  };
  
  // Initial data load
  useEffect(() => {
    if (user) {
      refreshSchools();
    }
  }, [user, userRole, regionId, sectorId]);
  
  return (
    <SchoolsContext.Provider 
      value={{
        schools,
        regions,
        sectors,
        loading,
        error,
        refreshSchools,
        handleCreateSchool,
        handleUpdateSchool,
        handleDeleteSchool,
        handleAssignAdmin,
        selectedSchool,
        selectedAdmin,
        isEditDialogOpen,
        isDeleteDialogOpen,
        isAdminDialogOpen,
        setIsEditDialogOpen,
        setIsDeleteDialogOpen,
        setIsAdminDialogOpen,
        setSelectedSchool,
        setSelectedAdmin,
        regionNames,
        sectorNames
      }}
    >
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

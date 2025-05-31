import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/lib/supabase';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { Loader2 } from 'lucide-react';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { toast } from 'sonner';

const Schools = () => {
  const { t } = useLanguageSafe();
  const user = useAuthStore(selectUser);
  const { 
    loading, 
    error, 
    schools,
    regions,
    sectors,
    currentItems,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    fetchSchools,
    setSchools,
    sortConfig,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    currentPage,
    totalPages,
    sectorsLoading,
    resetFilters
  } = useSchoolsStore();
  
  // Region və Sector adlarını hazırlayaq
  const regionNames = React.useMemo(() => {
    const regionMap: { [key: string]: string } = {};
    regions?.forEach(region => {
      regionMap[region.id] = region.name;
    });
    return regionMap;
  }, [regions]);

  const sectorNames = React.useMemo(() => {
    const sectorMap: { [key: string]: string } = {};
    sectors?.forEach(sector => {
      sectorMap[sector.id] = sector.name;
    });
    return sectorMap;
  }, [sectors]);

  // Məktəb əməliyyatları
  const handleCreateSchool = async (schoolData: Omit<any, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolData)
        .select('*')
        .single();
        
      if (error) throw error;
      
      setSchools([...(schools || []), data]);
      fetchSchools();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Məktəb yaratma xətası:', error);
      toast.error(t('schoolCreationFailed'));
      return Promise.reject(error);
    }
  };

  const handleEditSchool = async (schoolData: any) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({
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
          language: schoolData.language,
          status: schoolData.status || 'active',
        })
        .eq('id', schoolData.id);
        
      if (error) throw error;
      
      setSchools(schools?.map(school => 
        school.id === schoolData.id ? { ...school, ...schoolData } : school
      ) || []);
      fetchSchools();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Məktəb redaktə xətası:', error);
      toast.error(t('schoolUpdateFailed'));
      return Promise.reject(error);
    }
  };

  const handleDeleteSchool = async (school: any) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);
        
      if (error) throw error;
      
      setSchools(schools?.filter(s => s.id !== school.id) || []);
      fetchSchools();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Məktəb silmə xətası:', error);
      toast.error(t('schoolDeletionFailed'));
      return Promise.reject(error);
    }
  };

  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    try {
      // Əvvəlcə yoxlayaq görək user_roles-da var?
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('school_id', schoolId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingRole) {
        // Artıq təyin olunub, yeniləmək lazımdır
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: 'schooladmin' })
          .eq('id', existingRole.id);
          
        if (updateError) throw updateError;
      } else {
        // Yeni rol yaratmaq lazımdır
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'schooladmin',
            school_id: schoolId
          });
          
        if (insertError) throw insertError;
      }
      
      // Məktəbin admin_id field-ni də yeniləyək
      const { error: schoolUpdateError } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);
        
      if (schoolUpdateError) throw schoolUpdateError;
      
      fetchSchools();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      toast.error(t('adminAssignmentFailed'));
      return Promise.reject(error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive text-lg">{t('errorOccurred')}</p>
            <p className="text-muted-foreground">{t('couldNotLoadSchools')}</p>
          </div>
        ) : (
          <SchoolsContainer
            schools={schools || []}
            regions={regions || []}
            sectors={sectors || []}
            isLoading={loading || sectorsLoading}
            onRefresh={fetchSchools}
            onCreate={handleCreateSchool}
            onEdit={handleEditSchool}
            onDelete={handleDeleteSchool}
            onAssignAdmin={handleAssignAdmin}
            regionNames={regionNames}
            sectorNames={sectorNames}
          />
        )}
      </div>
    </>
  );
};

export default Schools;

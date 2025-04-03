
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

/**
 * Məktəb məlumatlarını idarə etmək üçün hook
 */
export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Məktəbləri yükləyən funksiya
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('schools').select(`
        *,
        regions (id, name),
        sectors (id, name)
      `);

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün məktəbləri görə bilər
          break;
        case 'regionadmin':
          query = query.eq('region_id', user.regionId);
          break;
        case 'sectoradmin':
          query = query.eq('sector_id', user.sectorId);
          break;
        case 'schooladmin':
          query = query.eq('id', user.schoolId);
          break;
        default:
          // Digər rollar üçün standart qaydalar
          if (user?.schoolId) {
            query = query.eq('id', user.schoolId);
          } else if (user?.sectorId) {
            query = query.eq('sector_id', user.sectorId);
          } else if (user?.regionId) {
            query = query.eq('region_id', user.regionId);
          }
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      // Supabase-dən gələn datanı School tipinə çevir
      const formattedSchools = data?.map(school => ({
        id: school.id,
        name: school.name,
        regionId: school.region_id,
        regionName: school.regions?.name || '',
        sectorId: school.sector_id,
        sectorName: school.sectors?.name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        principalName: school.principal_name || '',
        studentCount: school.student_count || 0,
        teacherCount: school.teacher_count || 0,
        type: school.type || '',
        language: school.language || '',
        status: school.status || 'active',
        logo: school.logo || '',
        adminEmail: school.admin_email || '',
        completionRate: school.completion_rate || 0,
        createdAt: school.created_at,
        updatedAt: school.updated_at
      })) || [];

      setSchools(formattedSchools);
      setLoading(false);
    } catch (err: any) {
      console.error('Məktəbləri yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Məktəbləri yükləyərkən xəta baş verdi');
    }
  }, [user]);

  // Məktəb yaratma funksiyası 
  const createSchool = useCallback(async (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // schoolData-nı Supabase formatına çevir
      const supabaseSchoolData = {
        name: schoolData.name,
        region_id: schoolData.regionId,
        sector_id: schoolData.sectorId,
        address: schoolData.address || '',
        phone: schoolData.phone || '',
        email: schoolData.email || '',
        principal_name: schoolData.principalName || '',
        student_count: schoolData.studentCount || 0,
        teacher_count: schoolData.teacherCount || 0,
        type: schoolData.type || '',
        language: schoolData.language || '',
        status: schoolData.status || 'active',
        logo: schoolData.logo || '',
        admin_email: schoolData.adminEmail || '',
        completion_rate: schoolData.completionRate || 0
      };

      const { data, error } = await supabase
        .from('schools')
        .insert(supabaseSchoolData)
        .select(`
          *,
          regions (id, name),
          sectors (id, name)
        `)
        .single();

      if (error) throw error;

      // Supabase-dən gələn datanı School tipinə çevir
      const newSchool: School = {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        regionName: data.regions?.name || '',
        sectorId: data.sector_id,
        sectorName: data.sectors?.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        principalName: data.principal_name || '',
        studentCount: data.student_count || 0,
        teacherCount: data.teacher_count || 0,
        type: data.type || '',
        language: data.language || '',
        status: data.status || 'active',
        logo: data.logo || '',
        adminEmail: data.admin_email || '',
        completionRate: data.completion_rate || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSchools(prev => [...prev, newSchool]);
      toast.success('Məktəb uğurla yaradıldı');
      return newSchool;
    } catch (err: any) {
      console.error('Məktəb yaradılarkən xəta:', err);
      toast.error('Məktəb yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Məktəb yeniləmə funksiyası
  const updateSchool = useCallback(async (schoolId: string, schoolData: Partial<School>) => {
    try {
      // schoolData-nı Supabase formatına çevir
      const supabaseSchoolData = {
        name: schoolData.name,
        region_id: schoolData.regionId,
        sector_id: schoolData.sectorId,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        principal_name: schoolData.principalName,
        student_count: schoolData.studentCount,
        teacher_count: schoolData.teacherCount,
        type: schoolData.type,
        language: schoolData.language,
        status: schoolData.status,
        logo: schoolData.logo,
        admin_email: schoolData.adminEmail,
        completion_rate: schoolData.completionRate
      };

      // Undefined sahələri təmizlə
      Object.keys(supabaseSchoolData).forEach(key => {
        if (supabaseSchoolData[key as keyof typeof supabaseSchoolData] === undefined) {
          delete supabaseSchoolData[key as keyof typeof supabaseSchoolData];
        }
      });

      const { data, error } = await supabase
        .from('schools')
        .update(supabaseSchoolData)
        .eq('id', schoolId)
        .select(`
          *,
          regions (id, name),
          sectors (id, name)
        `)
        .single();

      if (error) throw error;

      // Supabase-dən gələn datanı School tipinə çevir
      const updatedSchool: School = {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        regionName: data.regions?.name || '',
        sectorId: data.sector_id,
        sectorName: data.sectors?.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        principalName: data.principal_name || '',
        studentCount: data.student_count || 0,
        teacherCount: data.teacher_count || 0,
        type: data.type || '',
        language: data.language || '',
        status: data.status || 'active',
        logo: data.logo || '',
        adminEmail: data.admin_email || '',
        completionRate: data.completion_rate || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSchools(prev => prev.map(school => 
        school.id === schoolId ? updatedSchool : school
      ));
      
      toast.success('Məktəb uğurla yeniləndi');
      return updatedSchool;
    } catch (err: any) {
      console.error('Məktəb yenilənərkən xəta:', err);
      toast.error('Məktəb yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Məktəb silmə funksiyası
  const deleteSchool = useCallback(async (schoolId: string) => {
    try {
      // Məktəb ilə əlaqəli verilənləri sil
      const { count: entriesCount } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);
      
      // Admin sayını yoxla
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);
      
      // Məktəblə bağlı məlumatlar varsa xəbərdarlıq ver
      if (entriesCount && entriesCount > 0) {
        toast.warning(`Bu məktəblə əlaqəli ${entriesCount} məlumat var.`);
      }
      
      // Məktəblə bağlı adminlər varsa xəbərdarlıq, lakin yenə də silməyə imkan ver
      if (adminCount && adminCount > 0) {
        toast.warning(`Bu məktəblə əlaqəli ${adminCount} admin var.`);
      }
      
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.id !== schoolId));
      toast.success('Məktəb uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Məktəb silinərkən xəta:', err);
      toast.error('Məktəb silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool
  };
};

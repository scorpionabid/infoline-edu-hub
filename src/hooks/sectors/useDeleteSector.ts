import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface DeleteDependencies {
  schoolCount: number;
  adminCount: number;
  dataEntries: number;
  schoolDetails: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  adminDetails: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export const useDeleteSector = () => {
  const [loading, setLoading] = useState(false);
  const [checkingDependencies, setCheckingDependencies] = useState(false);
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  // Təbəli məlumatları yoxlayan funksiya
  const checkDependencies = useCallback(async (sectorId: string): Promise<DeleteDependencies> => {
    setCheckingDependencies(true);
    
    try {
      console.log('Sektor təbəliliklərini yoxlayırıq:', sectorId);

      // Məktəbləri yoxlayırıq
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, status')
        .eq('sector_id', sectorId);

      if (schoolsError) {
        console.error('Məktəb sorğu xətası:', schoolsError);
        throw new Error('Məktəb məlumatları yoxlanılarkən xəta baş verdi');
      }

      // Sektor adminlərini yoxlayırıq
      const { data: adminRoles, error: adminError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles:user_id(
            id,
            full_name,
            email
          )
        `)
        .eq('sector_id', sectorId)
        .eq('role', 'sectoradmin');

      if (adminError) {
        console.error('Admin sorğu xətası:', adminError);
        throw new Error('Admin məlumatları yoxlanılarkən xəta baş verdi');
      }

      // Sektor məlumat girişlərini yoxlayırıq
      const { count: dataEntriesCount, error: dataError } = await supabase
        .from('sector_data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);

      if (dataError) {
        console.error('Məlumat girişi sorğu xətası:', dataError);
        // Bu xəta kritik deyil, davam edə bilərik
      }

      const dependencies: DeleteDependencies = {
        schoolCount: schools?.length || 0,
        adminCount: adminRoles?.length || 0,
        dataEntries: dataEntriesCount || 0,
        schoolDetails: (schools || []).map(school => ({
          id: school.id,
          name: school.name,
          status: school.status || 'unknown'
        })),
        adminDetails: (adminRoles || []).map(role => ({
          id: role.profiles?.id || '',
          name: role.profiles?.full_name || 'Unknown',
          email: role.profiles?.email || ''
        })).filter(admin => admin.id) // boş ID-ları çıxarırıq
      };

      console.log('Təbəlilik yoxlaması tamamlandı:', dependencies);
      return dependencies;
      
    } catch (error: any) {
      console.error('Təbəlilik yoxlama xətası:', error);
      toast.error(error.message || 'Təbəli məlumatlar yoxlanılarkən xəta baş verdi');
      
      // Xəta halında boş nəticə qaytarırıq
      return {
        schoolCount: 0,
        adminCount: 0,
        dataEntries: 0,
        schoolDetails: [],
        adminDetails: []
      };
    } finally {
      setCheckingDependencies(false);
    }
  }, []);

  // Soft delete əməliyyatı
  const deleteSector = useCallback(async (
    sectorId: string, 
    force: boolean = false
  ): Promise<boolean> => {
    if (!sectorId) {
      toast.error('Sektor ID-si tələb olunur');
      return false;
    }

    setLoading(true);
    
    try {
      console.log('Sektor silmə əməliyyatı başladı:', { sectorId, force });

      // İlk olaraq sektorun mövcudluğunu yoxlayırıq
      const { data: currentSector, error: fetchError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (fetchError) {
        console.error('Sektor tapılmadı:', fetchError);
        throw new Error('Sektor tapılmadı');
      }

      if (!currentSector) {
        throw new Error('Sektor mövcud deyil');
      }

      // Əgər force deyilsə, təbəliliklər yoxlanmalıdır
      if (!force) {
        const dependencies = await checkDependencies(sectorId);
        
        if (dependencies.schoolCount > 0 || dependencies.adminCount > 0) {
          console.log('Təbəli məlumatlar tapıldı, soft delete həyata keçirilir');
          
          // Təbəli məlumatlar haqqında məlumat veririk
          let warningMessage = `Bu sektor silinərsə:\\n`;
          if (dependencies.schoolCount > 0) {
            warningMessage += `• ${dependencies.schoolCount} məktəb deaktiv olacaq\\n`;
          }
          if (dependencies.adminCount > 0) {
            warningMessage += `• ${dependencies.adminCount} admin rol təyin edilməyəcək\\n`;
          }
          if (dependencies.dataEntries > 0) {
            warningMessage += `• ${dependencies.dataEntries} məlumat girişi arxivləşəcək\\n`;
          }
          
          console.warn('Dependency warning:', warningMessage);
          // Warning-i UI-da göstərmək üçün toast istifadə edirik
          toast.warning(warningMessage.replace(/\\n/g, ' '));
        }
      }

      // Soft delete həyata keçiririk
      const deleteTimestamp = new Date().toISOString();
      const { data: deletedSector, error: deleteError } = await supabase
        .from('sectors')
        .update({
          status: 'inactive',
          updated_at: deleteTimestamp,
          // Soft delete üçün deleted_at sahəsi əlavə etmək olar
          // deleted_at: deleteTimestamp
        })
        .eq('id', sectorId)
        .select()
        .single();

      if (deleteError) {
        console.error('Sektor silmə xətası:', deleteError);
        throw new Error(deleteError.message || 'Sektor silinərkən xəta baş verdi');
      }

      // Təbəli məktəbləri də deaktiv edirik
      if (force) {
        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({
            status: 'inactive',
            updated_at: deleteTimestamp
          })
          .eq('sector_id', sectorId);

        if (schoolUpdateError) {
          console.warn('Məktəb statusları yenilənərkən xəta:', schoolUpdateError);
          // Bu xəta əsas əməliyyatı dayandırmasın
        }
      }

      // Audit log əlavə edirik
      try {
        // Audit log yazmaq üçün RLS policy-ni bypass edirik
        const { error: auditError } = await supabase.rpc('create_audit_log', {
          p_user_id: user?.id,
          p_action: force ? 'hard_delete' : 'soft_delete',
          p_entity_type: 'sector',
          p_entity_id: sectorId,
          p_old_value: currentSector,
          p_new_value: deletedSector
        });
        
        if (auditError) {
          console.warn('Audit log RPC xətası:', auditError);
          // Fallback - sadə audit log
          await supabase
            .from('audit_logs')
            .insert({
              action: force ? 'hard_delete' : 'soft_delete',
              entity_type: 'sector',
              entity_id: sectorId,
              created_at: deleteTimestamp
            });
        }
      } catch (auditError) {
        console.warn('Audit log yazılarkən xəta:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmasın
      }

      console.log('Sektor uğurla silindi (soft delete):', deletedSector);
      toast.success(t('sectors.deleteSuccess') || 'Sektor uğurla silindi');
      
      return true;
    } catch (error: any) {
      console.error('Sektor silmə xətası:', error);
      const errorMessage = error.message || t('sectors.deleteError') || 'Sektor silinərkən xəta baş verdi';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkDependencies, t, user]);

  // Həqiqi (hard) delete əməliyyatı
  const hardDeleteSector = useCallback(async (
    sectorId: string
  ): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log('Sektor həqiqi silmə əməliyyatı başladı:', sectorId);

      // İlk olaraq sektorun mövcudluğunu yoxlayırıq
      const { data: currentSector, error: fetchError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();

      if (fetchError || !currentSector) {
        throw new Error('Sektor tapılmadı');
      }

      // Təbəli məlumatları yoxlayırıq
      const dependencies = await checkDependencies(sectorId);
      
      console.log('Hard delete dependencies:', dependencies);
      
      // FK constraint-ləri aradan qaldırmaq üçün düzgün sıra ilə silirik
      
      // 1. Əvvəlcə school data entries-ları silirik
      if (dependencies.schoolCount > 0) {
        console.log('Məktəblərə aid data entries silirik...');
        const { error: schoolDataError } = await supabase
          .from('data_entries')
          .delete()
          .in('school_id', dependencies.schoolDetails.map(s => s.id));
          
        if (schoolDataError) {
          console.warn('Məktəb data entries silərkən xəta:', schoolDataError);
        }
      }
      
      // 2. School admin rollarını silirik
      if (dependencies.schoolCount > 0) {
        console.log('Məktəb admin rollarını silirik...');
        const { error: schoolAdminRolesError } = await supabase
          .from('user_roles')
          .delete()
          .in('school_id', dependencies.schoolDetails.map(s => s.id))
          .eq('role', 'schooladmin');
          
        if (schoolAdminRolesError) {
          console.warn('Məktəb admin rollarını silərkən xəta:', schoolAdminRolesError);
        }
      }
      
      // 3. Məktəbləri silirik
      if (dependencies.schoolCount > 0) {
        console.log('Təbəli məktəbləri silirik...');
        const { error: schoolDeleteError } = await supabase
          .from('schools')
          .delete()
          .eq('sector_id', sectorId);
          
        if (schoolDeleteError) {
          console.error('Məktəbləri silərkən xəta:', schoolDeleteError);
          throw new Error(`Məktəbləri silərkən xəta: ${schoolDeleteError.message}`);
        }
      }
      
      // 4. Sektor admin rollarını silirik
      if (dependencies.adminCount > 0) {
        console.log('Sektor admin rollarını silirik...');
        const { error: rolesDeleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('sector_id', sectorId)
          .eq('role', 'sectoradmin');
          
        if (rolesDeleteError) {
          console.warn('Sektor admin rollarını silərkən xəta:', rolesDeleteError);
        }
      }
      
      // 5. Sector data entries-ları silirik
      if (dependencies.dataEntries > 0) {
        console.log('Sektor məlumat girişlərini silirik...');
        const { error: dataDeleteError } = await supabase
          .from('sector_data_entries')
          .delete()
          .eq('sector_id', sectorId);
          
        if (dataDeleteError) {
          console.warn('Məlumat girişlərini silərkən xəta:', dataDeleteError);
        }
      }

      // Nəhayət sektorun özünü silirik
      const { error: deleteError } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorId);

      if (deleteError) {
        console.error('Sektor silmə xətası:', deleteError);
        throw new Error(deleteError.message || 'Sektor silinərkən xəta baş verdi');
      }

      console.log('Sektor və bütün təbəli məlumatları uğurla silindi');
      toast.success('Sektor və bütün əlaqəli məlumatları tamamilə silindi');
      
      return true;
    } catch (error: any) {
      console.error('Hard delete xətası:', error);
      const errorMessage = error.message || 'Sektor silinərkən xəta baş verdi';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkDependencies]);

  return {
    deleteSector, // soft delete
    hardDeleteSector, // hard delete
    checkDependencies,
    loading,
    checkingDependencies
  };
};

export default useDeleteSector;

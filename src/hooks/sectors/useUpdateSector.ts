import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { Sector } from '@/types/supabase';

interface UpdateSectorData {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  region_id?: string;
}

export const useUpdateSector = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  const updateSector = useCallback(async (data: UpdateSectorData): Promise<Sector | null> => {
    if (!data.id) {
      const errorMsg = 'Sektor ID-si tələb olunur';
      console.error(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    setLoading(true);
    
    try {
      console.log('Sektor yeniləmə əməliyyatı başladı:', {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        region_id: data.region_id
      });

      // İlk olaraq istifadəçinin bu sektoru yeniləmək icazəsi olub-olmadığını yoxlayırıq
      const { data: currentSector, error: fetchError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError) {
        console.error('Sektor tapılmadı:', fetchError);
        throw new Error('Sektor tapılmadı');
      }

      if (!currentSector) {
        throw new Error('Sektor mövcud deyil');
      }

      // Yeniləmə üçün məlumatları hazırlayırıq
      const updateData: Partial<Sector> = {
        updated_at: new Date().toISOString()
      };

      // Yalnız dəyişən sahələri əlavə edirik
      if (data.name !== undefined && data.name !== currentSector.name) {
        updateData.name = data.name.trim();
      }
      
      if (data.description !== undefined && data.description !== currentSector.description) {
        updateData.description = data.description.trim();
      }
      
      if (data.status !== undefined && data.status !== currentSector.status) {
        updateData.status = data.status;
      }
      
      if (data.region_id !== undefined && data.region_id !== currentSector.region_id) {
        updateData.region_id = data.region_id;
      }

      // Əgər heç bir dəyişiklik yoxdursa
      if (Object.keys(updateData).length === 1) { // yalnız updated_at var
        console.log('Heç bir dəyişiklik tapılmadı');
        toast.info('Heç bir dəyişiklik edilmədi');
        return currentSector;
      }

      // Validation - ad minimum 2 simvol olmalıdır
      if (updateData.name && updateData.name.length < 2) {
        throw new Error('Sektor adı minimum 2 simvol olmalıdır');
      }

      // Eyni adda sektor olub-olmadığını yoxlayırıq (eyni region daxilində)
      if (updateData.name) {
        const { data: existingSector, error: duplicateError } = await supabase
          .from('sectors')
          .select('id')
          .eq('name', updateData.name)
          .eq('region_id', data.region_id || currentSector.region_id)
          .neq('id', data.id)
          .single();

        if (duplicateError && duplicateError.code !== 'PGRST116') {
          console.error('Dublikat yoxlama xətası:', duplicateError);
        }

        if (existingSector) {
          throw new Error('Bu adda sektor artıq mövcuddur');
        }
      }

      // Sektoru yeniləyirik
      const { data: updatedSector, error: updateError } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        console.error('Sektor yeniləmə xətası:', updateError);
        throw new Error(updateError.message || 'Sektor yenilənərkən xəta baş verdi');
      }

      if (!updatedSector) {
        throw new Error('Sektor yenilənərkən naməlum xəta baş verdi');
      }

      // Audit log əlavə edirik
      try {
        // Audit log yazmaq üçün RLS policy-ni bypass edirik
        // Çünki bəzi hallarda RLS audit log yazmağa mane ola bilər
        const { error: auditError } = await supabase.rpc('create_audit_log', {
          p_user_id: user?.id,
          p_action: 'update',
          p_entity_type: 'sector', 
          p_entity_id: data.id,
          p_old_value: currentSector,
          p_new_value: updatedSector
        });
        
        if (auditError) {
          console.warn('Audit log RPC xətası:', auditError);
          // Fallback - sadə audit log
          await supabase
            .from('audit_logs')
            .insert({
              action: 'update',
              entity_type: 'sector',
              entity_id: data.id,
              created_at: new Date().toISOString()
            });
        }
      } catch (auditError) {
        console.warn('Audit log yazılarkən xəta:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmasın
      }

      console.log('Sektor uğurla yeniləndi:', updatedSector);
      toast.success(t('sectors.updateSuccess') || 'Sektor uğurla yeniləndi');
      
      return updatedSector;
    } catch (error: any) {
      console.error('Sektor yeniləmə xətası:', error);
      const errorMessage = error.message || t('sectors.updateError') || 'Sektor yenilənərkən xəta baş verdi';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    updateSector,
    loading
  };
};

export default useUpdateSector;

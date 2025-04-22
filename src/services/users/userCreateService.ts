import { supabase } from '@/integrations/supabase/client';
import { CreateUserData, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { addAuditLog } from '@/hooks/auth/userDataService';
import { getUser } from './userFetchService';

// Yeni istifadəçi yarat
export const createUser = async (userData: CreateUserData): Promise<FullUserData | null> => {
  try {
    // Əvvəlki məlumatları saxlayaq audit üçün
    const oldData = null;
    
    // Cari istifadəçinin JWT token-ini əldə edirik
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Sessiya əldə edilərkən xəta:', sessionError);
      throw new Error(`İstifadəçi yaradıla bilmədi: ${sessionError.message}`);
    }
    
    if (!session) {
      throw new Error('İstifadəçi yaradıla bilmədi: Sessiya tapılmadı');
    }
    
    // Supabase client vasitəsilə birbaşa istifadəçi yaradırıq
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        role: userData.role,
        status: userData.status || 'active'
      }
    });
    
    if (authError) {
      console.error('İstifadəçi yaradılarkən xəta:', authError);
      throw new Error(`İstifadəçi yaradıla bilmədi: ${authError.message}`);
    }
    
    if (!authData || !authData.user) {
      throw new Error('İstifadəçi yaradıla bilmədi: Serverdən cavab alınmadı');
    }
    
    const userId = authData.user.id;
    
    // Profil məlumatlarını əlavə edirik
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        status: (userData.status || 'active') as 'active' | 'inactive' | 'blocked'
      });
    
    if (profileError) {
      console.error('Profil yaradılarkən xəta:', profileError);
      // Profil yaradılmasa da, istifadəçi yaradıldığı üçün xəta atılmır
      // sadəcə log edilir
    }
    
    // Rol məlumatlarını əlavə edirik
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: userData.role as any,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      });
    
    if (roleError) {
      console.error('Rol yaradılarkən xəta:', roleError);
      // Rol yaradılmasa da, istifadəçi yaradıldığı üçün xəta atılmır
      // sadəcə log edilir
    }
    
    // Region admin təyin etmək (əgər regionadmin rolu seçilibsə)
    if (userData.role === 'regionadmin' && userData.region_id) {
      const { error: regionUpdateError } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', userData.region_id);
        
      if (regionUpdateError) {
        console.error('Region admin təyin edilərkən xəta:', regionUpdateError);
        // Bu xəta istifadəçi yaratmağa mane olmamalıdır, sadəcə log edilir
      }
    }
    
    // Yeni yaradılmış istifadəçini əldə et
    const newUser = await getUser(userId);
    
    if (!newUser) {
      throw new Error('İstifadəçi yaradıldı, lakin məlumatları əldə edilə bilmədi');
    }
    
    // Audit log əlavə et
    await addAuditLog(
      'create',
      'user',
      newUser.id,
      oldData,
      newUser
    );
    
    toast.success('İstifadəçi uğurla yaradıldı', {
      description: `${userData.full_name} (${userData.email}) istifadəçisi yaradıldı`
    });
    
    return newUser;
  } catch (error: any) {
    console.error('İstifadəçi yaradılarkən xəta:', error);
    toast.error(`İstifadəçi yaradıla bilmədi: ${error.message}`);
    return null;
  }
};

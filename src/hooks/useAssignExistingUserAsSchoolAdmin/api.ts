
import { supabase } from '@/integrations/supabase/client';
import { AssignUserResult, AssignSchoolAdminParams } from './types';

export const assignSchoolAdminApi = async (
  params: AssignSchoolAdminParams
): Promise<AssignUserResult> => {
  try {
    const { userId, schoolId } = params;
    
    // Edge funksiyasını çağıraq
    const { data, error } = await supabase.functions.invoke('assign-existing-user-as-school-admin', {
      body: { userId, schoolId }
    });
    
    console.log('Edge funksiyasından gələn cavab:', data, 'xəta:', error);
    
    // Əgər API sorğusu xəta verərsə
    if (error) {
      console.error('Edge funksiya xətası:', error);
      return { 
        success: false, 
        error: error.message || 'Gözlənilməz xəta'
      };
    }
    
    // data null və ya undefined olarsa
    if (data === null || data === undefined) {
      console.error('Edge funksiyasından gələn cavab boşdur');
      return { 
        success: false, 
        error: 'Serverdən cavab alınmadı'
      };
    }
    
    // Əgər data.success false olarsa (funksiya uğursuz olub)
    if (data && data.success === false) {
      console.error('Admin təyin edilərkən xəta:', data.error);
      return { 
        success: false, 
        error: data.error || 'Gözlənilməz xəta'
      };
    }
    
    // Uğurlu hal
    return { success: true, data };
  } catch (error: any) {
    console.error('Admin təyin etmək istisna:', error);
    return { 
      success: false, 
      error: error?.message || 'Gözlənilməz xəta'
    };
  }
};

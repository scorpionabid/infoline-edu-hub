
import { createRpcFunction } from './rpc';

// Mövcud istifadəçini məktəb admini kimi təyin etmək üçün əsas funksiya
export async function assignUserAsSchoolAdmin(supabase: any, userId: string, schoolId: string) {
  try {
    console.log(`assignUserAsSchoolAdmin başladı - userId: ${userId}, schoolId: ${schoolId}`);
    
    // 1. Parametrləri yoxla
    if (!userId || !schoolId) {
      const missingParam = !userId ? 'userId' : 'schoolId';
      console.error(`Zəruri parametr çatışmır: ${missingParam}`);
      return { 
        success: false, 
        error: `Zəruri parametr çatışmır: ${missingParam}`
      };
    }
    
    // 2. SQL funksiyasını çağıraq
    try {
      const assignSchoolAdminRpc = createRpcFunction(supabase, 'assign_school_admin');
      const { data, error } = await assignSchoolAdminRpc({ 
        user_id_param: userId, 
        school_id_param: schoolId 
      });
      
      if (error) {
        console.error('assign_school_admin RPC xətası:', error);
        return { 
          success: false, 
          error: `Məktəb admini təyin edilərkən xəta: ${error.message}` 
        };
      }
      
      console.log('assign_school_admin RPC nəticəsi:', data);
      
      // 3. SQL funksiyasının nəticəsini qaytaraq
      return data;
      
    } catch (error) {
      console.error('RPC çağırışı istisna:', error);
      return {
        success: false,
        error: `RPC çağırışı xətası: ${error.message}`
      };
    }
    
  } catch (error) {
    console.error('Ümumi xəta:', error);
    return {
      success: false,
      error: error.message || 'Məktəb admini təyin edilərkən xəta baş verdi'
    };
  }
}

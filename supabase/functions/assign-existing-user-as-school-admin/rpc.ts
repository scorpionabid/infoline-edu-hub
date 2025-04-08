
// RPC funksiyası getdikdə istifadə ediləcək köməkçi metod
export function createRpcFunction(supabase: any, functionName: string) {
  return async (params: any = {}) => {
    try {
      console.log(`RPC funksiyası çağırılır: ${functionName} ilə parametrlər:`, params);
      const { data, error } = await supabase.rpc(functionName, params);
      
      if (error) {
        console.error(`RPC funksiyası xətası (${functionName}):`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`RPC funksiyası istisna (${functionName}):`, error);
      return { data: null, error };
    }
  };
}

// Auth istifadəçisini təhlükəsiz şəkildə əldə etmək üçün köməkçi funksiya
export async function getUserById(supabase: any, userId: string) {
  try {
    // İstifadəçini auth tablosundan əldə etmək üçün RPC
    const rpcName = 'safe_get_user_by_id';
    console.log(`${rpcName} RPC funksiyası çağırılır, userId: ${userId}`);
    
    const { data, error } = await supabase.rpc(rpcName, { user_id: userId });
    
    if (error) {
      console.error(`${rpcName} RPC xətası:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('getUserById istisna:', error);
    return { data: null, error };
  }
}

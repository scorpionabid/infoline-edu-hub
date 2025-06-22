
// Auth utility functions
import { supabase } from '@/integrations/supabase/client';

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const isAuthenticated = async () => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
};

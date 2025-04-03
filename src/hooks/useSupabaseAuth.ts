
// Düzgün re-export üçün src/hooks/auth altındakı fayl istifadə edilir
import useSupabaseAuth from '@/hooks/auth/useSupabaseAuth';
import { getUserData } from '@/hooks/auth/userDataService';

export { useSupabaseAuth, getUserData };
export default useSupabaseAuth;

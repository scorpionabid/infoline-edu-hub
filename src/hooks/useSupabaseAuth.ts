
// Bu fayl sadəcə auth/useSupabaseAuth faylını yenidən ixrac edir
import { useSupabaseAuth } from './auth/useSupabaseAuth';
import { FullUserData, Profile } from '@/types/supabase';
import { AuthState, AuthActions, UseSupabaseAuthReturn } from './auth/types';

export { useSupabaseAuth };
export type { AuthState, AuthActions, UseSupabaseAuthReturn, FullUserData, Profile };

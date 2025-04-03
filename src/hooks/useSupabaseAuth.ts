// Əvvəlcədən daxil edilmiş useAuth hook-unu istifadə edin, bu fayl saxlanılır
// yalnız geriyə uyğunluq üçün
import { useAuth } from '@/context/AuthContext';
import { FullUserData, UserRole } from '@/types/supabase';

export { useAuth };
export type { FullUserData, UserRole };

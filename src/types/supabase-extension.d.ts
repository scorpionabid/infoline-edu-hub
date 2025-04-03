
/**
 * Bu fayl Supabase üçün əlavə tip deklarasiyaları təmin edir.
 * Supabase-in RPC funksiyalarına əlavə funksiya tiplərini əlavə etmək üçün istifadə olunur.
 */

import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient<
    Database = any,
    SchemaName extends string & keyof Database = 'public' extends keyof Database
      ? 'public'
      : string & keyof Database,
  > {
    rpc<
      FunctionName extends string,
      Args extends Record<string, any> = Record<string, any>,
    >(
      fn: FunctionName,
      args?: Args,
      options?: {
        head?: boolean;
        count?: 'exact' | 'planned' | null;
      }
    ): any;
  }
}

import { createClient } from '@supabase/supabase-js';
import type { FullUserData } from '@/types/supabase';

// Supabase konfiqurasiyası
const supabaseUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co';
// Anon key - istifadəçi autentifikasiyası üçün (Supabase dashboard-dan əldə edilən)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
// Service role key - RLS qaydalarını bypass etmək üçün (Supabase dashboard-dan əldə edilən)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzUzMzMxNywiZXhwIjoyMDEzMTA5MzE3fQ.mIHF-BO2JQpwXOVvUDGwNH8o_E1JbdSjsYNi-Qrz_7w';

// Normal istifadəçilər üçün Supabase klienti
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    }
  }
});

// Supabase klientinə auth dəyişikliklərinə abunə olaq
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Session mövcuddursa, Authorization header-ini əlavə edək
    supabaseClient.functions.setAuth(session.access_token);
  }
});

// API açarını əldə etmək üçün klientə xüsusiyyət əlavə edək
export const supabase = Object.assign(supabaseClient, {
  supabaseUrl,
  supabaseKey: supabaseAnonKey
});

// Admin əməliyyatları üçün service_role ilə Supabase klienti
// Bu klient RLS qaydalarını bypass edir
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'apikey': supabaseServiceKey,
      'Content-Type': 'application/json'
    }
  }
});

// Admin klientinə də API açarını əlavə edək
export const supabaseAdmin = Object.assign(supabaseAdminClient, {
  supabaseUrl,
  supabaseKey: supabaseServiceKey
});

// Real-time kanal yaratma funksiyası
export const createRealTimeChannel = (channelName: string, table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*', filter?: string) => {
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
        filter
      }, 
      (payload) => {
        console.log('Real-time dəyişiklik:', payload);
        return payload;
      }
    );
};

// Data yükləmə üçün yardımçı funksiya
export const fetchData = async <T>(
  tableName: string,
  columns: string = '*',
  filters?: { column: string; value: any; operator?: string }[],
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<{ data: T[] | null; error: any }> => {
  try {
    let query = supabase.from(tableName).select(columns);

    // Filtrləri əlavə et
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        const operator = filter.operator || 'eq';
        if (operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        } else if (operator === 'neq') {
          query = query.neq(filter.column, filter.value);
        } else if (operator === 'gt') {
          query = query.gt(filter.column, filter.value);
        } else if (operator === 'lt') {
          query = query.lt(filter.column, filter.value);
        } else if (operator === 'gte') {
          query = query.gte(filter.column, filter.value);
        } else if (operator === 'lte') {
          query = query.lte(filter.column, filter.value);
        } else if (operator === 'in') {
          query = query.in(filter.column, filter.value);
        }
      });
    }

    // Seçimlər əlavə et
    if (options) {
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false
        });
      }
    }

    const { data, error } = await query;
    return { data: data as T[], error };
  } catch (error) {
    console.error('Data yükləmə xətası:', error);
    return { data: null, error };
  }
};

import { createClient } from '@supabase/supabase-js';
import type { FullUserData } from '@/types/supabase';

// Supabase konfiqurasiyası
const supabaseUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzUzMzMxNywiZXhwIjoyMDEzMTA5MzE3fQ.mIHF-BO2JQpwXOVvUDGwNH8o_E1JbdSjsYNi-Qrz_7w';

// Token yenilənməsini izləmək üçün dəyişənlər
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Təkrar cəhdlər üçün konfiqurasiya
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 saniyə

// Gözləmə funksiyası
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Normal istifadəçilər üçün Supabase klienti
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'infoline-edu-hub'
    }
  }
});

// Əlavə xüsusiyyətlər əlavə edək
Object.assign(supabase, {
  supabaseUrl,
  supabaseKey: supabaseAnonKey
});

// Token yenilənməsi üçün helper funksiya
export const refreshToken = async () => {
  if (isRefreshing) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  
  try {
    refreshPromise = supabase.auth.refreshSession();
    const result = await refreshPromise;
    return result;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

// Supabase sorğuları üçün wrapper funksiya
export const supabaseFetch = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    // Sorğunu göndər
    return await operation();
  } catch (error: any) {
    // Şəbəkə xətası və ya 429 (Too Many Requests) xətası halında təkrar cəhd et
    if ((error?.message === 'Failed to fetch' || error?.status === 429) && retries > 0) {
      console.warn(`Network error, retrying (${retries} attempts left)...`);
      await wait(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Eksponensial gözləmə
      return supabaseFetch(operation, retries - 1);
    }
    
    // 401 xətası alındıqda token yenilənməsini sına
    if (error?.status === 401 && !isRefreshing) {
      try {
        await refreshToken();
        // Yenilənmiş token ilə sorğunu təkrarla
        return await operation();
      } catch (refreshError) {
        console.error('Token refresh and retry failed:', refreshError);
        throw refreshError;
      }
    }
    
    // Digər xətalar üçün xətanı yenidən at
    throw error;
  }
};

// Edge Functions üçün helper funksiya
// Edge Functions üçün helper funksiya
export const callEdgeFunction = async <T>(
  functionName: string,
  body: any = {},
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    // Supabase SDK vasitəsilə Edge Function-a sorğu göndər
    // Custom header-lər əlavə etmədən
    const { data, error } = await supabase.functions.invoke(functionName, {
      body
    });
    
    if (error) {
      console.error(`Edge function ${functionName} error:`, error);
      
      // Əgər CORS xətasıdırsa və təkrar cəhd sayı qalıbsa
      if (retries > 0 && (
        error.message?.includes('CORS') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError')
      )) {
        console.warn(`CORS or network error, retrying (${retries} attempts left)...`);
        await wait(RETRY_DELAY * (MAX_RETRIES - retries + 1));
        return callEdgeFunction(functionName, body, retries - 1);
      }
      
      throw error;
    }
    
    return data as T;
  } catch (error: any) {
    // Şəbəkə xətası və ya 429 (Too Many Requests) xətası halında təkrar cəhd et
    if ((error?.message === 'Failed to fetch' || error?.status === 429) && retries > 0) {
      console.warn(`Edge function network error, retrying (${retries} attempts left)...`);
      await wait(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Eksponensial gözləmə
      return callEdgeFunction(functionName, body, retries - 1);
    }
    
    // 401 xətası alındıqda token yenilənməsini sına
    if (error?.status === 401 && !isRefreshing) {
      try {
        await refreshToken();
        // Yenilənmiş token ilə sorğunu təkrarla
        return await callEdgeFunction(functionName, body, retries);
      } catch (refreshError) {
        console.error('Token refresh and retry failed:', refreshError);
        throw refreshError;
      }
    }
    
    // Digər xətalar üçün xətanı yenidən at
    throw error;
  }
};

// Supabase klientinə auth dəyişikliklərinə abunə olaq
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  if (session) {
    // Session mövcuddursa, Authorization header-ini əlavə edək
    supabase.functions.setAuth(session.access_token);
  }
});

// Admin əməliyyatları üçün service_role ilə Supabase klienti
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-application-name': 'infoline-edu-hub-admin'
    }
  }
});

// Admin klientinə də API açarını əlavə edək
Object.assign(supabaseAdmin, {
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

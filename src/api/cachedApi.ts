
import { supabase } from '@/integrations/supabase/client';

type QueryConfig = {
  table: string;
  select?: string;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains' | 'ilike';
    value: any;
  }>;
  orderBy?: {
    column: string;
    ascending: boolean;
  };
  limit?: number;
  offset?: number;
};

type CacheOptions = {
  cacheKey?: string;
  expirySeconds?: number;
  bypassCache?: boolean;
};

/**
 * Keşlənmiş sorğu üçün utilit funksiya
 * @description Edge Function-dan keşlənmiş məlumat əldə edir və ya serverless keşləmə istifadə edir
 */
export async function fetchCached<T = any>(
  query: QueryConfig,
  options: CacheOptions = {}
): Promise<{ data: T[]; count: number | null; source: 'cache' | 'database'; cachedAt: string }> {
  const {
    cacheKey = query.table,
    expirySeconds = 300,
    bypassCache = false
  } = options;
  
  try {
    // Supabase Edge Function-a sorğu göndərək
    const response = await supabase.functions.invoke('cached-query', {
      body: {
        query,
        params: {}
      },
      headers: {
        'x-cache-key': cacheKey,
        'x-cache-expiry': expirySeconds.toString(),
        'x-bypass-cache': bypassCache ? 'true' : 'false'
      }
    });
    
    if (response.error) {
      throw new Error(`Keşlənmiş sorğu xətası: ${response.error.message}`);
    }
    
    return response.data;
  } catch (apiError) {
    console.error('Keşlənmiş APİ sorğusu zamanı xəta:', apiError);
    
    // Edge Function xəta verərsə, birbaşa Supabase-ə sorğu göndərək
    console.log('Ehtiyat üsul: Birbaşa supabase sorğusu göndərilir');
    
    let queryBuilder = supabase.from(query.table).select(query.select || '*');
    
    // Filtrləri əlavə edək
    if (query.filters) {
      for (const filter of query.filters) {
        const { column, operator, value } = filter;
        
        if (operator === 'eq') {
          queryBuilder = queryBuilder.eq(column, value);
        } else if (operator === 'neq') {
          queryBuilder = queryBuilder.neq(column, value);
        } else if (operator === 'gt') {
          queryBuilder = queryBuilder.gt(column, value);
        } else if (operator === 'lt') {
          queryBuilder = queryBuilder.lt(column, value);
        } else if (operator === 'gte') {
          queryBuilder = queryBuilder.gte(column, value);
        } else if (operator === 'lte') {
          queryBuilder = queryBuilder.lte(column, value);
        } else if (operator === 'in') {
          queryBuilder = queryBuilder.in(column, value);
        } else if (operator === 'contains') {
          queryBuilder = queryBuilder.contains(column, value);
        } else if (operator === 'ilike') {
          queryBuilder = queryBuilder.ilike(column, `%${value}%`);
        }
      }
    }
    
    // Sıralama əlavə edək
    if (query.orderBy) {
      queryBuilder = queryBuilder.order(query.orderBy.column, { ascending: query.orderBy.ascending });
    }
    
    // Limit əlavə edək
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    // Offset əlavə edək
    if (query.offset) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 10) - 1);
    }
    
    try {
      const { data, error, count } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        data: data as T[],
        count,
        source: 'database',
        cachedAt: new Date().toISOString()
      };
    } catch (dbError) {
      console.error('Verilənlər bazası sorğusu zamanı xəta:', dbError);
      throw dbError;
    }
  }
}

/**
 * Keşdən xüsusi bir məlumat növünü silmək
 */
export async function invalidateCachedQuery(cacheKey: string): Promise<void> {
  try {
    await supabase.functions.invoke('invalidate-cache', {
      body: { cacheKey }
    });
  } catch (error) {
    console.error(`${cacheKey} keşini invalidasiya edərkən xəta:`, error);
  }
}

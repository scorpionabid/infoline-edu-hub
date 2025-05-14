
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, CategoryFilter, CategoryStatus } from '@/types/category';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/environment';

// Enhanced fetch utility to prevent request loops and handle authentication
async function fetchWithControlledRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3
): Promise<T | null> {
  const authStore = useAuthStore.getState();
  const session = authStore.session;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Profile': 'public',
    'apikey': SUPABASE_ANON_KEY
  };

  // Add authentication headers if session exists
  if (session?.access_token) {
    defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'include',
  };

  let retries = 0;
  const baseDelay = 1000; // 1 second base delay

  while (retries < maxRetries) {
    try {
      // Check if session is valid before making the request
      if (!session) {
        console.warn('No active session, skipping fetch');
        return null;
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        // Handle specific authentication-related errors
        if (response.status === 401) {
          console.warn('Unauthorized access, attempting to refresh session');
          await authStore.refreshSession();
          return null;
        }

        console.warn(`Fetch error (attempt ${retries + 1}):`, {
          status: response.status,
          statusText: response.statusText,
          url
        });

        // Specific handling for different status codes
        if (response.status === 429) {
          // Too Many Requests - use longer backoff
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, retries)));
        } else if (response.status >= 500) {
          // Server errors - retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, retries)));
        } else {
          // For other errors, break the retry loop
          break;
        }

        retries++;
        continue;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Network error (attempt ${retries + 1}):`, error);
      
      // Network errors or parsing errors
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, retries)));
      retries++;
    }
  }

  toast.error('Failed to fetch data after multiple attempts');
  return null;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const { session, user } = useAuthStore();

  const fetchCategories = useCallback(async (filter: CategoryFilter = {}) => {
    // Only fetch if authenticated
    if (!session || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construct Supabase REST API URL with filters
      const baseUrl = `${SUPABASE_URL}/rest/v1/categories`;
      const queryParams = new URLSearchParams({
        select: '*',
        order: 'name.asc',
        ...(filter.status ? { status: Array.isArray(filter.status) ? filter.status.join(',') : filter.status } : {}),
        ...(filter.search ? { name: `ilike.%${filter.search}%` } : {}),
        offset: String((currentPage - 1) * pageSize),
        limit: String(pageSize)
      });

      const url = `${baseUrl}?${queryParams}`;

      const data = await fetchWithControlledRetry<Category[]>(url);

      if (data) {
        setCategories(data);
        setTotalCount(data.length);
      }
    } catch (error: any) {
      setError(error.message);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, session, user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: {
    name: string;
    description: string;
    deadline: string | Date;  
    status: CategoryStatus;
    priority: number;
    assignment: string;
    archived: boolean;
  }) => {
    // Only create if authenticated
    if (!session || !user) {
      toast.error('Autentifikasiya tələb olunur');
      return null;
    }

    try {
      const baseUrl = `${SUPABASE_URL}/rest/v1/categories`;
      
      const processedCategory = {
        ...category,
        deadline: typeof category.deadline === 'object' && category.deadline instanceof Date 
          ? category.deadline.toISOString().split('T')[0] 
          : category.deadline
      };

      const data = await fetchWithControlledRetry<Category[]>(baseUrl, {
        method: 'POST',
        body: JSON.stringify(processedCategory)
      });

      if (data && data.length > 0) {
        const newCategory = data[0];
        setCategories(prev => [...prev, newCategory]);
        toast.success('Kateqoriya uğurla yaradıldı');
        return newCategory;
      }
      return null;
    } catch (error) {
      console.error('Unexpected error creating category:', error);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      return null;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    currentPage,
    setCurrentPage,
    totalCount
  };
};

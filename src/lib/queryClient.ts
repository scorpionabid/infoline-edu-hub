
import { QueryClient } from '@tanstack/react-query';

// Bütün sorğu nəticələrini keşləmək üçün varsayılan vaxt (5 dəqiqə)
const CACHE_TIME = 1000 * 60 * 5;

// QueryClient-i bir dəfə yaradır və bütün tətbiq üçün istifadə edirik
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME, // Keşdəki məlumatları nə qədər müddət saxlamalı
      refetchOnWindowFocus: false, // Pəncərəyə fokus qayıtdıqda yenidən sorğu göndərmək
      retry: 1, // Xəta baş verdikdə sorğu cəhdlərinin sayı
    },
  }
});

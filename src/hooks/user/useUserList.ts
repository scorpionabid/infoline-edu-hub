
import { useState, useCallback, useRef, useEffect } from 'react';
import { FullUserData, UserFilter } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

// Səhifə əsaslı keş mexanizmi
interface PageCache {
  [key: number]: FullUserData[];
}

// Keş məlumatları - səhifələr arası yenidən yüklənməni minimuma endirmək üçün
const userCache = {
  byPage: {} as PageCache,
  totalCount: 0,
  lastQueryTime: 0
};

// Aktiv sorğu kontrolu
let isUserListRequestInProgress = false;

export function useUserList(initialFilters?: UserFilter) {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilter>(initialFilters || {});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorğu kontrolu və keşləmə üçün ref-lər
  const lastQueryTimeRef = useRef<number>(0);
  const lastQueryFiltersRef = useRef<string>('');
  const shouldFetchRef = useRef<boolean>(true);
  
  // Filtrlərdən unikal açar yaradır - stabil funksiya
  const getFilterKey = useCallback((filtersObj: UserFilter): string => {
    return JSON.stringify(filtersObj);
  }, []);

  // Keş yoxlama funksiyaları - stabil versiya
  const isDataInCache = useCallback((page: number, currentFilters: UserFilter): boolean => {
    const filterKey = getFilterKey(currentFilters);
    return !!userCache.byPage[page] && lastQueryFiltersRef.current === filterKey;
  }, [getFilterKey]);
  
  // Keşdən istifadəçi məlumatlarını alır
  const getUsersFromCache = useCallback((page: number, filterKey: string): FullUserData[] | null => {
    // Keşdə bu səhifə üçün məlumatlar varsa və filtrlər eynidir
    if (userCache.byPage[page] && lastQueryFiltersRef.current === filterKey) {
      console.log(`Using cached data for page ${page}`);
      return userCache.byPage[page];
    }
    return null;
  }, []);

  // Məlumatları əldə etmək üçün əsas funksiya - asilılıqları MINIMUM-a endirilmiş versiya
  const fetchUsers = useCallback(async (newFilters?: UserFilter, forceRefresh = false): Promise<FullUserData[]> => {
    // Bu funksiyanın içində istifadə olunacaq filtrləri tap
    const effectiveFilters = newFilters || filters;
    const currentFilterKey = getFilterKey(effectiveFilters);
    const currentPageToFetch = currentPage; // Local dəyişəndə saxla ki, funksiya içində closure problemləri olmasın
    
    console.log(`fetchUsers called for page ${currentPageToFetch} with force=${forceRefresh}`);

    // Manual sorğu yeniləməsi yoxdursa və shouldFetchRef false-dursa, sorğu göndərmə
    if (!forceRefresh && !shouldFetchRef.current) {
      console.log('Fetch skipped: shouldFetchRef is false and no force refresh');
      return users; // Moəvcud məlumatları qaytar
    }

    try {
      // Yüklənmə başladı
      setLoading(true);
      setError(null);
      
      console.log(`Fetching users for page ${currentPageToFetch}:`, effectiveFilters);
      
      // Keşdən məlumatları yükləməyə çalış
      if (!forceRefresh) {
        const cachedData = userCache.byPage[currentPageToFetch];
        // Əgər keşdə məlumatlar varsa və filtrlər dəyişməyibsə
        if (cachedData && lastQueryFiltersRef.current === currentFilterKey) {
          console.log(`Using cached data for page ${currentPageToFetch}`); 
          setUsers(cachedData);
          setTotalCount(userCache.totalCount);
          setTotalPages(Math.ceil(userCache.totalCount / 10));
          setLoading(false);
          return cachedData;
        }
      }
      
      // Əgər sorğu artıq davam edirsə, gözlə
      if (isUserListRequestInProgress) {
        console.log('User list request already in progress, skipping duplicate');
        setLoading(false);
        return users;
      }
      
      // Sorğu başladı
      isUserListRequestInProgress = true;
      lastQueryTimeRef.current = Date.now();
      lastQueryFiltersRef.current = currentFilterKey;

      // Use profiles table correctly
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPageToFetch - 1) * 10, currentPageToFetch * 10 - 1);
      
      if (error) {
        throw error;
      }
      
      // Uğurlu nəticələri emal et
      const fetchedUsers = (data || []).map((item: any) => ({
        id: item.id,
        email: item.email || '',
        fullName: item.full_name || '',
        full_name: item.full_name || '',
        role: 'user',
        status: item.status || 'active',
        created_at: item.created_at,
        updated_at: item.updated_at,
        phone: item.phone,
        language: item.language,
        position: item.position
      })) as FullUserData[];
      
      console.log(`Query successful: ${fetchedUsers.length} users, total: ${count}`);
      
      // Keşi yenilə
      userCache.byPage[currentPageToFetch] = fetchedUsers;
      userCache.totalCount = count || 0;
      
      // State-ləri yenilə
      setUsers(fetchedUsers);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));
      
      // Bu səhifə üçün sorğu artıq lazım deyil
      shouldFetchRef.current = false;
      isUserListRequestInProgress = false;
      
      return fetchedUsers;
    } catch (err: any) {
      console.error('Error in fetchUsers:', err);
      setError(err.message || 'Failed to fetch users');
      return [];
    } finally {
      setLoading(false);
      isUserListRequestInProgress = false; // Həmişə sorgu bitdikdə bayraq sıfırlanmalıdır
    }
  }, []); // BOŞ asılılıq massivi

  // Filterləri yeniləyir
  const updateFilter = useCallback((newFilter: UserFilter) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1); // Reset page when filter changes
    
    // Filtr dəyişdikdə mövcud keşi sıfırla
    Object.keys(userCache.byPage).forEach(key => {
      delete userCache.byPage[Number(key)];
    });
    
    // Filtr dəyişdikdə yeni sorğu etmək lazım olacaq
    shouldFetchRef.current = true;
  }, []);

  // Bütün filterləri sıfırlayır
  const resetFilter = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
    
    // Bütün keşi sıfırla
    Object.keys(userCache.byPage).forEach(key => {
      delete userCache.byPage[Number(key)];
    });
    
    // Filtrlər sıfırlandıqda yeni sorğu etmək lazım olacaq
    shouldFetchRef.current = true;
  }, []);

  // Məlumatları yenidən yükləyir
  const refetch = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      // Bütün keşi sıfırla
      Object.keys(userCache.byPage).forEach(key => {
        delete userCache.byPage[Number(key)];
      });
    }
    
    // Yeni sorğu etmək lazım olacaq
    shouldFetchRef.current = true;
    return fetchUsers(undefined, forceRefresh);
  }, [fetchUsers]);

  // Sorğu davranışı üçün əsas useEffect - kökdən həll
  useEffect(() => {
    const fetchData = async () => {
      // Yalnız manual sorğu tələb olunduğu halda sorğu göndər
      if (!shouldFetchRef.current) {
        console.log(`Skipping fetch for page ${currentPage} - no fetch required`);
        return;
      }
      
      console.log(`Executing fetch for page ${currentPage} because shouldFetchRef is true`);
      
      try {
        // sorğu davam edir
        isUserListRequestInProgress = true;
        
        // Sorğunu icra et - bu filterləri və currentPage-i closure üzərindən əldə edir
        await fetchUsers();
        
        // Sorğu tamamlandı - bayraqları sıfırla
        shouldFetchRef.current = false;
        isUserListRequestInProgress = false;
      } catch (err) {
        console.error('Error in fetchData useEffect:', err);
        isUserListRequestInProgress = false;
      }
    };
    
    fetchData();
  }, [currentPage]);
  
  // Səhifə dəyişdikdə shouldFetchRef-i yenilə - stabil versiya
  const lastCheckedPageRef = useRef<number>(0);
  const lastCheckedFiltersRef = useRef<string>('');
  
  useEffect(() => {
    // Güncəl filterlərin açarını al
    const currentFilterKey = getFilterKey(filters);
    
    // Eyni səhifə/filter kombinasiyası üçün təkrar yoxlamaları əngəllə
    if (lastCheckedPageRef.current === currentPage && 
        lastCheckedFiltersRef.current === currentFilterKey) {
      return; // Eyni səhifə/filter yükləndiyində heç nə etmə
    }
    
    // Əgər bu kombinasiya üçün məlumatlar keşdə varsa
    if (isDataInCache(currentPage, filters)) {
      // Konsol mesajını yalnız dəyişiklik olduqda göstər
      if (shouldFetchRef.current) {
        console.log(`Page ${currentPage} data exists in cache - fetch not needed`);
      }
      shouldFetchRef.current = false;
    } else {
      // Konsol mesajını yalnız dəyişiklik olduqda göstər
      if (!shouldFetchRef.current) {
        console.log(`Page ${currentPage} data not in cache or filters changed - fetch needed`);
      }
      shouldFetchRef.current = true;
    }
    
    // Yoxlanan səhifə/filter-ləri yadda saxla
    lastCheckedPageRef.current = currentPage;
    lastCheckedFiltersRef.current = currentFilterKey;
  }, [currentPage, filters, getFilterKey, isDataInCache]);

  return {
    users,
    loading,
    error,
    filter: filters,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  };
}

export default useUserList;

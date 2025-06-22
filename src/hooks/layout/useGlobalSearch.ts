import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce, useLocalStorage } from '@/hooks/common';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import type { UserRole } from '@/types/supabase';

interface SearchResult {
  id: string;
  type: 'school' | 'user' | 'category' | 'action';
  title: string;
  subtitle?: string;
  action: () => void;
}

interface UseGlobalSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  recentSearches: string[];
  clearRecentSearches: () => void;
}

export const useGlobalSearch = (): UseGlobalSearchResult => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const { hasRole } = usePermissions();

  // Use refs to avoid dependency issues
  const hasRoleRef = useRef(hasRole);
  const navigateRef = useRef(navigate);
  
  // Update refs when values change
  useEffect(() => {
    hasRoleRef.current = hasRole;
    navigateRef.current = navigate;
  }, [hasRole, navigate]);

  // Generate quick actions without dependencies
  const getQuickActions = useCallback((): SearchResult[] => {
    const actions: SearchResult[] = [];
    const currentHasRole = hasRoleRef.current;
    const currentNavigate = navigateRef.current;

    if (currentHasRole(['superadmin', 'regionadmin', 'sectoradmin'])) {
      actions.push({
        id: 'new-school',
        type: 'action',
        title: 'Yeni məktəb əlavə et',
        subtitle: 'Sistembə yeni məktəb əlavə edin',
        action: () => currentNavigate('/schools?action=create')
      });
    }

    if (currentHasRole(['schooladmin', 'sectoradmin'])) {
      actions.push({
        id: 'excel-upload',
        type: 'action',
        title: 'Excel faylı yüklə',
        subtitle: 'Toplu məlumat yükləyin',
        action: () => currentNavigate('/data-entry?action=upload')
      });
    }

    if (currentHasRole(['superadmin', 'regionadmin', 'sectoradmin'])) {
      actions.push({
        id: 'create-report',
        type: 'action',
        title: 'Yeni hesabat yarat',
        subtitle: 'Məlumat hesabatı hazırlayın',
        action: () => currentNavigate('/reports?action=create')
      });
    }

    return actions;
  }, []); // No dependencies

  // Execute search when debounced query changes
  useEffect(() => {
    const performSearch = async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const searchResults: SearchResult[] = [];

      try {
        // Search schools
        if (hasRoleRef.current(['superadmin', 'regionadmin', 'sectoradmin'])) {
          const { data: schools } = await supabase
            .from('schools')
            .select('id, name, region_id, sector_id')
            .ilike('name', `%${searchQuery}%`)
            .limit(5);

          if (schools) {
            schools.forEach(school => {
              searchResults.push({
                id: `school-${school.id}`,
                type: 'school',
                title: school.name,
                subtitle: 'Məktəb',
                action: () => navigateRef.current(`/schools?id=${school.id}`)
              });
            });
          }
        }

        // Search users
        if (hasRoleRef.current(['superadmin', 'regionadmin', 'sectoradmin'])) {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
            .limit(5);

          if (users) {
            users.forEach(user => {
              searchResults.push({
                id: `user-${user.id}`,
                type: 'user',
                title: user.full_name || user.email,
                subtitle: user.email,
                action: () => navigateRef.current(`/users?id=${user.id}`)
              });
            });
          }
        }

        // Search categories
        if (hasRoleRef.current(['superadmin', 'regionadmin', 'sectoradmin'])) {
          const { data: categories } = await supabase
            .from('categories')
            .select('id, name')
            .ilike('name', `%${searchQuery}%`)
            .eq('archived', false)
            .limit(5);

          if (categories) {
            categories.forEach(category => {
              searchResults.push({
                id: `category-${category.id}`,
                type: 'category',
                title: category.name,
                subtitle: 'Kateqoriya',
                action: () => navigateRef.current(`/categories?id=${category.id}`)
              });
            });
          }
        }

        // Add quick actions if query matches
        const quickActions = getQuickActions();
        quickActions.forEach(action => {
          if (action.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            searchResults.push(action);
          }
        });

        setResults(searchResults);

        // Add to recent searches if not empty and not already there
        if (searchQuery.trim() && searchResults.length > 0) {
          setRecentSearches(prev => {
            if (!prev.includes(searchQuery)) {
              return [searchQuery, ...prev.slice(0, 9)];
            }
            return prev;
          });
        }

      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, getQuickActions]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    recentSearches,
    clearRecentSearches
  };
};
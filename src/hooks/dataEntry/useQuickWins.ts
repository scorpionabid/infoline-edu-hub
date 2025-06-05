
import { useState, useMemo, useCallback } from 'react';

export interface UseQuickWinsResult {
  // Navigation
  currentCategoryIndex: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
  
  // School management
  selectedSchoolId: string | null;
  selectedSchool: any | null;
  setSelectedSchoolId: (schoolId: string | null) => void;
  
  // Category management
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  
  // Search
  schoolSearchQuery: string;
  setSchoolSearchQuery: (query: string) => void;
  
  // Progress tracking
  overallProgress: number;
  categoryStats: {
    completed: number;
    total: number;
  };
}

export function useDataEntryQuickWins(
  categories: any[] = [],
  schools: any[] = []
): UseQuickWinsResult {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // Find selected school
  const selectedSchool = useMemo(() => {
    return schools.find(school => school.id === selectedSchoolId) || null;
  }, [schools, selectedSchoolId]);

  // Navigation capabilities
  const canGoPrevious = useMemo(() => {
    return currentCategoryIndex > 0;
  }, [currentCategoryIndex]);

  const canGoNext = useMemo(() => {
    return currentCategoryIndex < categories.length - 1;
  }, [currentCategoryIndex, categories.length]);

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      const newIndex = currentCategoryIndex - 1;
      setCurrentCategoryIndex(newIndex);
      setSelectedCategoryId(categories[newIndex]?.id || null);
    }
  }, [currentCategoryIndex, canGoPrevious, categories]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      const newIndex = currentCategoryIndex + 1;
      setCurrentCategoryIndex(newIndex);
      setSelectedCategoryId(categories[newIndex]?.id || null);
    }
  }, [currentCategoryIndex, canGoNext, categories]);

  // Progress calculation
  const overallProgress = useMemo(() => {
    if (!selectedSchool) return 0;
    return selectedSchool.completion_rate || 0;
  }, [selectedSchool]);

  const categoryStats = useMemo(() => {
    // Mock calculation - this should be replaced with real data
    const completed = Math.floor(categories.length * (overallProgress / 100));
    return {
      completed,
      total: categories.length
    };
  }, [categories.length, overallProgress]);

  return {
    // Navigation
    currentCategoryIndex,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext,
    
    // School management
    selectedSchoolId,
    selectedSchool,
    setSelectedSchoolId,
    
    // Category management
    selectedCategoryId,
    setSelectedCategoryId,
    
    // Search
    schoolSearchQuery,
    setSchoolSearchQuery,
    
    // Progress
    overallProgress,
    categoryStats
  };
}

export default useDataEntryQuickWins;

import { useState, useCallback, useMemo } from 'react';

export const useDataEntryQuickWins = (categories: any[], schools: any[]) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!categories.length) return 0;
    
    const totalFields = categories.reduce((sum, cat) => sum + (cat.required_fields || 0), 0);
    const completedFields = categories.reduce((sum, cat) => sum + (cat.completed_fields || 0), 0);
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }, [categories]);

  // Category stats
  const categoryStats = useMemo(() => {
    const completed = categories.filter(cat => {
      const rate = cat.required_fields > 0 ? (cat.completed_fields || 0) / cat.required_fields : 0;
      return rate === 1;
    }).length;

    return {
      completed,
      total: categories.length,
      overallProgress
    };
  }, [categories, overallProgress]);

  // Navigation helpers
  const currentCategoryIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
  const canGoPrevious = currentCategoryIndex > 0;
  const canGoNext = currentCategoryIndex < categories.length - 1;

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setSelectedCategoryId(categories[currentCategoryIndex - 1].id);
    }
  }, [categories, currentCategoryIndex, canGoPrevious]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setSelectedCategoryId(categories[currentCategoryIndex + 1].id);
    }
  }, [categories, currentCategoryIndex, canGoNext]);

  // Get selected school info
  const selectedSchool = schools.find(school => school.id === selectedSchoolId);

  return {
    // State
    selectedSchoolId,
    setSelectedSchoolId,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolSearchQuery,
    setSchoolSearchQuery,
    
    // Computed values
    overallProgress,
    categoryStats,
    selectedSchool,
    
    // Navigation
    currentCategoryIndex,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext
  };
};
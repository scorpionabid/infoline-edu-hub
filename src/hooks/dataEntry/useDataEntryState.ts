
import { useState } from 'react';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { CategoryWithData } from '@/hooks/useDataEntry';

export const useDataEntryState = () => {
  const [dataEntries, setDataEntries] = useState<Record<string, DataEntry>>({});
  const [categoryStatus, setCategoryStatus] = useState<DataEntryStatus>('draft');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [categories, setCategories] = useState<CategoryWithData[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [formData, setFormData] = useState({
    status: 'draft' as DataEntryStatus,
    entries: [] as any[],
    lastSaved: '',
    overallProgress: 0
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [errors, setErrors] = useState<Array<{columnId: string, message: string}>>([]);
  const [isReady, setIsReady] = useState(false); // Yeni state: komponent yüklənməyə hazır olduğunu göstərir

  return {
    dataEntries,
    categoryStatus,
    unsavedChanges,
    submitting,
    loadingEntries,
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    errors,
    isReady,
    setDataEntries,
    setCategoryStatus,
    setUnsavedChanges,
    setSubmitting,
    setLoadingEntries,
    setCategories,
    setCurrentCategoryIndex,
    setFormData,
    setIsAutoSaving,
    setErrors,
    setIsReady
  };
};

import { useState, useCallback } from 'react';

interface DataEntryWorkflowState {
  // Mode management
  mode: 'single' | 'bulk' | null;
  step: 'mode' | 'context' | 'target' | 'input';
  
  // Context
  selectedCategory: string | null;
  selectedColumn: string | null;
  
  // Target selection
  selectedSchools: string[];
  
  // Data
  inputValue: string;
  
  // UI States
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Progress
  completedSteps: string[];
  
  // 🆕 Yeni field-lər
  entryType: 'school' | 'sector';
  targetType: 'schools' | 'sector';
}

export const useDataEntryWorkflow = () => {
  const [state, setState] = useState<DataEntryWorkflowState>({
    mode: null,
    step: 'mode',
    selectedCategory: null,
    selectedColumn: null,
    selectedSchools: [],
    inputValue: '',
    isLoading: false,
    errors: {},
    completedSteps: [],
    
    // 🆕 Yeni field-lər default dəyərləri
    entryType: 'school',
    targetType: 'schools'
  });

  // Step validation logic
  const canProceedToContext = state.mode !== null;
  const canProceedToTarget = state.selectedCategory && state.selectedColumn;
  
  // 🆕 Sector mode üçün target step skip edilir
  const canProceedToInput = state.entryType === 'sector' 
    ? true  // Sector mode-da target step skip olunur
    : state.selectedSchools.length > 0;

  const canProceed = {
    context: canProceedToContext,
    target: canProceedToTarget,
    input: canProceedToInput
  };

  // Step navigation - sector mode üçün target step skip edilir
  const nextStep = useCallback(() => {
    const stepOrder = ['mode', 'context', 'target', 'input'];
    const currentIndex = stepOrder.indexOf(state.step);
    let nextStepKey = stepOrder[currentIndex + 1];
    
    // 🆕 Sector mode-da context-dən birbaşa input-a keç
    if (state.entryType === 'sector' && state.step === 'context') {
      nextStepKey = 'input';
    }
    
    if (nextStepKey) {
      setState(prev => ({
        ...prev,
        step: nextStepKey as DataEntryWorkflowState['step'],
        completedSteps: [...prev.completedSteps, prev.step]
      }));
    }
  }, [state.step, state.entryType]);

  const previousStep = useCallback(() => {
    const stepOrder = ['mode', 'context', 'target', 'input'];
    const currentIndex = stepOrder.indexOf(state.step);
    let prevStepKey = stepOrder[currentIndex - 1];
    
    // 🆕 Sector mode-da input-dan birbaşa context-ə qayit
    if (state.entryType === 'sector' && state.step === 'input') {
      prevStepKey = 'context';
    }
    
    if (prevStepKey) {
      setState(prev => ({
        ...prev,
        step: prevStepKey as DataEntryWorkflowState['step'],
        completedSteps: prev.completedSteps.filter(step => step !== prevStepKey)
      }));
    }
  }, [state.step, state.entryType]);

  const goToStep = useCallback((step: DataEntryWorkflowState['step']) => {
    setState(prev => ({
      ...prev,
      step
    }));
  }, []);

  // Mode management
  const setMode = useCallback((mode: 'single' | 'bulk') => {
    setState(prev => ({
      ...prev,
      mode,
      selectedSchools: [] // Reset school selection when mode changes
    }));
  }, []);

  // Context management
  const setCategoryAndColumn = useCallback((categoryId: string, columnId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      selectedColumn: columnId
    }));
  }, []);

  const setCategory = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      selectedColumn: null // Reset column when category changes
    }));
  }, []);

  const setColumn = useCallback((columnId: string) => {
    setState(prev => ({
      ...prev,
      selectedColumn: columnId
    }));
  }, []);

  // School selection management
  const setSelectedSchools = useCallback((schoolIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedSchools: schoolIds
    }));
  }, []);

  const addSchool = useCallback((schoolId: string) => {
    setState(prev => ({
      ...prev,
      selectedSchools: [...prev.selectedSchools, schoolId]
    }));
  }, []);

  const removeSchool = useCallback((schoolId: string) => {
    setState(prev => ({
      ...prev,
      selectedSchools: prev.selectedSchools.filter(id => id !== schoolId)
    }));
  }, []);

  const toggleSchool = useCallback((schoolId: string) => {
    setState(prev => ({
      ...prev,
      selectedSchools: prev.selectedSchools.includes(schoolId)
        ? prev.selectedSchools.filter(id => id !== schoolId)
        : [...prev.selectedSchools, schoolId]
    }));
  }, []);

  // Input management
  const setInputValue = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      inputValue: value
    }));
  }, []);

  // Loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  // Error management
  const setError = useCallback((key: string, message: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: message
      }
    }));
  }, []);

  const clearError = useCallback((key: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [key]: undefined
      }
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {}
    }));
  }, []);

  // 🆕 Entry type management
  const setEntryType = useCallback((entryType: 'school' | 'sector') => {
    setState(prev => ({
      ...prev,
      entryType,
      targetType: entryType === 'sector' ? 'sector' : 'schools',
      selectedSchools: [] // Reset target selection when type changes
    }));
  }, []);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setState({
      mode: null,
      step: 'mode',
      selectedCategory: null,
      selectedColumn: null,
      selectedSchools: [],
      inputValue: '',
      isLoading: false,
      errors: {},
      completedSteps: [],
      
      // 🆕 Yeni field-lər default dəyərləri
      entryType: 'school',
      targetType: 'schools'
    });
  }, []);

  // Progress calculation
  const progress = (() => {
    const stepOrder = ['mode', 'context', 'target', 'input'];
    const currentIndex = stepOrder.indexOf(state.step);
    return ((currentIndex + 1) / stepOrder.length) * 100;
  })();

  return {
    // State
    ...state,
    
    // Computed values
    canProceed,
    progress,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    
    // Mode management
    setMode,
    
    // 🆕 Entry type management
    setEntryType,
    
    // Context management
    setCategoryAndColumn,
    setCategory,
    setColumn,
    
    // School selection
    setSelectedSchools,
    addSchool,
    removeSchool,
    toggleSchool,
    
    // Input management
    setInputValue,
    
    // Loading state
    setLoading,
    
    // Error management
    setError,
    clearError,
    clearAllErrors,
    
    // Reset
    resetWorkflow
  };
};
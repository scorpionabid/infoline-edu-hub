
import { useState, useReducer, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ActionType, CategoryEntryData } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/column';

const initialState = {
  loading: true,
  categories: [] as CategoryWithColumns[],
  currentCategory: 0,
  error: null as Error | null,
  isSubmitting: false,
  isAutoSaving: false,
  status: 'draft' as 'draft' | 'submitted' | 'approved' | 'rejected',
  lastSaved: '',
  progress: 0
};

function reducer(state: typeof initialState, action: ActionType) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, loading: false };
    case 'SET_CURRENT_CATEGORY':
      return { ...state, currentCategory: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_IS_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_IS_AUTO_SAVING':
      return { ...state, isAutoSaving: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    default:
      return state;
  }
}

export function useDataEntryState() {
  const { schoolId = '', categoryId = '' } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [entryData, setEntryData] = useState<CategoryEntryData[]>([]);

  // Mock data for demonstration
  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockCategories: CategoryWithColumns[] = [
        {
          id: "cat-1",
          name: "Məktəb haqqında məlumatlar",
          description: "Əsas məktəb məlumatları",
          deadline: "2023-12-31",
          status: "active",
          priority: 1,
          assignment: "all",
          createdAt: "2023-01-01",
          order: 1,
          columns: [
            {
              id: "col-1",
              categoryId: "cat-1",
              name: "Şagird sayı",
              type: "number",
              isRequired: true,
              status: "active",
              order: 1,
              orderIndex: 1,
              validation: {}
            }
          ]
        }
      ];

      const mockEntryData: CategoryEntryData[] = [
        {
          categoryId: "cat-1",
          entries: [
            {
              id: "entry-1",
              columnId: "col-1",
              value: "100",
              status: "pending"
            }
          ],
          status: "draft",
          values: [],
          completionPercentage: 50,
          isCompleted: false,
          isSubmitted: false
        }
      ];

      dispatch({ type: 'SET_CATEGORIES', payload: mockCategories });
      setEntryData(mockEntryData);
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
      dispatch({ type: 'SET_PROGRESS', payload: 50 });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  }, [schoolId, categoryId]);

  return {
    ...state,
    entryData,
    setEntryData,
    fetchData,
    schoolId,
    categoryId,
    dispatch
  };
}

export default useDataEntryState;

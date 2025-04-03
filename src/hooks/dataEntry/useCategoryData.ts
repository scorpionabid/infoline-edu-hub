
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategoryWithColumns } from "@/types/column";
import { CategoryEntryData } from "@/types/dataEntry";
import { User } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { uuid } from '@/lib/utils';

interface UseCategoryDataProps {
  schoolId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook to fetch and manage category data
 * for the data entry form
 */
export const useCategoryData = ({ 
  schoolId,
  onSuccess,
  onError
}: UseCategoryDataProps) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [categoryEntryData, setCategoryEntryData] = useState<CategoryEntryData[]>([]);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for testing
      const mockCategories = [
        {
          id: "cat-1",
          name: "Məktəb haqqında məlumatlar",
          description: "Əsas məktəb məlumatları",
          assignment: "all" as const,
          deadline: "2023-12-31",
          status: "active",
          priority: 1,
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
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
              orderIndex: 1
            },
            {
              id: "col-2",
              categoryId: "cat-1",
              name: "Müəllim sayı",
              type: "number",
              isRequired: true,
              status: "active",
              order: 2,
              orderIndex: 2
            }
          ]
        },
        {
          id: "cat-2",
          name: "Təhsil göstəriciləri",
          description: "Təhsil nəticələri",
          assignment: "all" as const,
          deadline: "2023-12-31",
          status: "active",
          priority: 2,
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          order: 2,
          columns: [
            {
              id: "col-3",
              categoryId: "cat-2",
              name: "Olimpiada nəticələri",
              type: "number",
              isRequired: true,
              status: "active",
              order: 1,
              orderIndex: 3
            }
          ]
        }
      ];

      // Set categories with order property
      setCategories(mockCategories as CategoryWithColumns[]);
      
      // Generate empty entry data
      const emptyEntryData = mockCategories.map(category => ({
        categoryId: category.id,
        entries: category.columns.map(column => ({
          id: uuid(),
          columnId: column.id,
          value: null,
          status: "pending" as const,
        })),
        status: "draft" as const,
        values: [], // For backward compatibility
        isCompleted: false,
        isSubmitted: false,
        completionPercentage: 0
      }));

      // Set the entry data
      setCategoryEntryData(emptyEntryData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err as Error);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, onSuccess, onError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveEntryData = useCallback(async (data: CategoryEntryData[]) => {
    try {
      // In a real app, save to the database
      console.log("Saving entry data:", data);
      
      // Update the local state
      setCategoryEntryData(data);
      
      toast.success("Məlumatlar uğurla saxlanıldı");
      return true;
    } catch (err) {
      console.error("Error saving entry data:", err);
      toast.error("Məlumatlar saxlanılarkən xəta baş verdi");
      return false;
    }
  }, []);

  const submitEntryData = useCallback(async (data: CategoryEntryData[]) => {
    try {
      // In a real app, submit to the database
      console.log("Submitting entry data:", data);
      
      // Update the local state
      setCategoryEntryData(data);
      
      toast.success("Məlumatlar uğurla təqdim edildi");
      return true;
    } catch (err) {
      console.error("Error submitting entry data:", err);
      toast.error("Məlumatlar təqdim edilərkən xəta baş verdi");
      return false;
    }
  }, []);

  return {
    categories,
    categoryEntryData,
    loading,
    error,
    fetchCategories,
    saveEntryData,
    submitEntryData
  };
};

export default useCategoryData;

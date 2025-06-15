
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddCategoryFormData, Category, formatDeadlineForApi } from "@/types/category";
import { useToast } from "@/components/ui/use-toast";

export const useCategoryForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const createCategory = async (data: AddCategoryFormData): Promise<Category | null> => {
    setIsLoading(true);
    
    try {
      const deadline = formatDeadlineForApi(data.deadline);
      
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description,
          assignment: data.assignment,
          status: data.status,
          priority: data.priority,
          deadline: deadline,
          order_index: data.order_index || 0,
        })
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Error creating category",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      });
      
      return newCategory as Category;
    } catch (error: any) {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    createCategory
  };
};

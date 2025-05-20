
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface CreateCategoryDialogProps {
  onClose: () => void;
  onCategoryCreated?: () => void;
}

export const handleCreateCategory = async (data: any, { onClose, onCategoryCreated }: CreateCategoryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  
  setIsSubmitting(true);
  
  try {
    // Format deadline as an ISO string if it exists
    const formattedData = {
      name: data.name, // Ensure name is included and required
      description: data.description,
      assignment: data.assignment || 'all',
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      status: data.status || 'active'
    };
    
    // Use insert with a single object, not an array
    const { error } = await supabase
      .from('categories')
      .insert(formattedData); // Pass a single object, not an array

    if (error) {
      throw new Error(error.message);
    }
    
    toast.success(t('categoryCreatedSuccess'));
    onClose();
    if (onCategoryCreated) {
      onCategoryCreated();
    }
  } catch (error: any) {
    console.error('Failed to create category:', error);
    toast.error(t('categoryCreateError'));
  } finally {
    setIsSubmitting(false);
  }
};

export default handleCreateCategory;

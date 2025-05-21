
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { CreateCategoryDialogProps } from '@/types/category';

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ 
  onClose, 
  onCategoryCreated,
  open,
  onOpenChange,
  isOpen 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  
  // Support both controlled (open/onOpenChange) and simple (onClose) patterns
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onClose) {
      onClose();
    }
  };
  
  const handleCreateCategory = async (data: any) => {
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
      
      // Use insert with a single object
      const { error } = await supabase
        .from('categories')
        .insert(formattedData);

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(t('categoryCreatedSuccess'));
      handleClose();
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

  return (
    <div>
      {/* Your dialog UI components here */}
      <h2>{t('createCategory')}</h2>
      {/* Add form fields for category creation */}
      <button onClick={handleClose} disabled={isSubmitting}>
        {t('cancel')}
      </button>
      <button onClick={() => handleCreateCategory({name: 'New Category'})} disabled={isSubmitting}>
        {isSubmitting ? t('creating') : t('create')}
      </button>
    </div>
  );
};

export default CreateCategoryDialog;


// Fix the part where we insert a new category without a required name field
// Assuming there's a form submission function that needs fixing
// This is a partial update of the file

// Update the onSubmit handler to ensure name is provided
const handleCreateCategory = async (data) => {
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
  } catch (error) {
    console.error('Failed to create category:', error);
    toast.error(t('categoryCreateError'));
  } finally {
    setIsSubmitting(false);
  }
};

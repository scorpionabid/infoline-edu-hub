
// Form validation utilities
export const validateField = (value: any, rules: any) => {
  if (rules?.required && !value) {
    return 'Bu sahə məcburidir';
  }
  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, any>) => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(fieldId => {
    const error = validateField(data[fieldId], rules[fieldId]);
    if (error) {
      errors[fieldId] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

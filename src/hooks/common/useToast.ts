
import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const toast = (options: string | ToastOptions) => {
  // Əgər string olarsa, birbaşa göstər
  if (typeof options === 'string') {
    sonnerToast(options);
    return;
  }
  
  // Obyektin içərisində obyekt olub-olmadığını yoxla
  const title = typeof options.title === 'object' && options.title !== null 
    ? JSON.stringify(options.title) 
    : options.title || '';
    
  const description = typeof options.description === 'object' && options.description !== null 
    ? JSON.stringify(options.description) 
    : options.description || '';
  
  // Variant tipinə görə müvafiq toast növünü göstər
  if (options.variant === 'destructive') {
    sonnerToast.error(title, {
      description,
      duration: options.duration
    });
  } else {
    sonnerToast.success(title, {
      description,
      duration: options.duration
    });
  }
};

const useToast = () => {
  return {
    toast: (options: string | ToastOptions) => {
      if (typeof options === 'string') {
        sonnerToast(options);
      } else {
        if (options.variant === 'destructive') {
          sonnerToast.error(options.title || 'Error', {
            description: options.description,
            duration: options.duration
          });
        } else {
          sonnerToast.success(options.title || 'Success', {
            description: options.description,
            duration: options.duration
          });
        }
      }
    },
    success: (title: string, description?: string) => {
      sonnerToast.success(title, { description });
    },
    error: (title: string, description?: string) => {
      sonnerToast.error(title, { description });
    }
  };
};

export { useToast };
export default useToast;

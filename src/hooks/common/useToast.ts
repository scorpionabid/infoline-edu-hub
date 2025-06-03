
import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      sonnerToast(options);
    } else {
      const { title, description, variant = 'default' } = options;
      
      if (variant === 'destructive') {
        sonnerToast.error(title || 'Error', {
          description: description
        });
      } else {
        sonnerToast.success(title || 'Success', {
          description: description
        });
      }
    }
  };

  return { toast };
};

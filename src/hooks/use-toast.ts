
import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  return {
    toast: (options: string | ToastOptions) => {
      if (typeof options === 'string') {
        return toast(options);
      }
      
      if (options.variant === 'destructive') {
        return toast.error(options.title || options.description || '');
      }
      
      return toast(options.title || options.description || '');
    },
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
  };
};

export { toast };

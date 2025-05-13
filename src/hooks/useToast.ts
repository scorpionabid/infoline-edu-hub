
import { toast } from 'sonner';

export function useToast() {
  return {
    toast: {
      success: (title: string, options?: { description?: string }) => {
        toast.success(title, options);
      },
      error: (title: string, options?: { description?: string }) => {
        toast.error(title, options);
      },
      warning: (title: string, options?: { description?: string }) => {
        toast.warning(title, options);
      },
      info: (title: string, options?: { description?: string }) => {
        toast.info(title, options);
      }
    }
  };
}

export { toast };


import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (message: string, options?: any) => {
      if (options?.description) {
        toast(message, { description: options.description });
      } else {
        toast(message);
      }
    },
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message)
  };
};

export default useToast;

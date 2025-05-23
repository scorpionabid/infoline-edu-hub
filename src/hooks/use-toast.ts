
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
    toasts: []
  };
};

export default useToast;

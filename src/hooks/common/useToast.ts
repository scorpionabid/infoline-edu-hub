
import { toast } from 'sonner';

export const useToast = () => {
  const toastFn = (message: string, options?: any) => {
    if (options?.description) {
      toast(message, { description: options.description });
    } else {
      toast(message);
    }
  };

  toastFn.success = (message: string) => toast.success(message);
  toastFn.error = (message: string) => toast.error(message);
  toastFn.warning = (message: string) => toast.warning(message);
  toastFn.info = (message: string) => toast.info(message);

  return {
    toast: toastFn,
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message)
  };
};

export default useToast;

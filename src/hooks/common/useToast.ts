
import { toast } from 'sonner';

export const useToast = () => {
  const toastFn = (message: string, options?: { description?: string }) => {
    if (options?.description) {
      toast(message, { description: options.description });
    } else {
      toast(message);
    }
  };

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  const warning = (message: string) => toast.warning(message);
  const info = (message: string) => toast.info(message);

  toastFn.success = success;
  toastFn.error = error;
  toastFn.warning = warning;
  toastFn.info = info;

  return {
    toast: toastFn,
    success,
    error,
    warning,
    info
  };
};

export default useToast;


import { toast } from 'sonner';

export const useToast = () => {
  const showToast = (message: string) => {
    toast(message);
  };

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);
  const warning = (message: string) => toast.warning(message);
  const info = (message: string) => toast.info(message);

  // Return both individual methods and the main toast function
  return {
    toast: showToast,
    success,
    error,
    warning,
    info
  };
};

export default useToast;

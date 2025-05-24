
import { toast } from 'sonner';

export const useToast = () => {
  const showToast = (message: string | { title: string; description?: string; variant?: string }) => {
    if (typeof message === 'string') {
      toast(message);
    } else {
      if (message.variant === 'destructive') {
        toast.error(message.title, message.description ? { description: message.description } : {});
      } else {
        toast(message.title, message.description ? { description: message.description } : {});
      }
    }
  };

  const success = (message: string | { title: string; description?: string }) => {
    if (typeof message === 'string') {
      toast.success(message);
    } else {
      toast.success(message.title, message.description ? { description: message.description } : {});
    }
  };

  const error = (message: string | { title: string; description?: string }) => {
    if (typeof message === 'string') {
      toast.error(message);
    } else {
      toast.error(message.title, message.description ? { description: message.description } : {});
    }
  };

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


import { toast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
};

export const useToast = () => {
  return {
    toast,
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'success'
      });
    },
    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'destructive'
      });
    },
    warning: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: 'warning'
      });
    },
    info: (title: string, description?: string) => {
      toast({
        title,
        description,
      });
    }
  };
};

export { toast };

export default useToast;

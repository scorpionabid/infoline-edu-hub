
import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast,
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
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

export default useToast;

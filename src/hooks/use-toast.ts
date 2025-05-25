
import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
  const toast = (message: string | { title: string; description?: string; variant?: string }) => {
    if (typeof message === 'string') {
      sonnerToast(message);
    } else {
      if (message.variant === 'destructive') {
        sonnerToast.error(message.title, { description: message.description });
      } else {
        sonnerToast(message.title, { description: message.description });
      }
    }
  };

  return { toast };
};

export const toast = (message: string | { title: string; description?: string; variant?: string }) => {
  if (typeof message === 'string') {
    sonnerToast(message);
  } else {
    if (message.variant === 'destructive') {
      sonnerToast.error(message.title, { description: message.description });
    } else {
      sonnerToast(message.title, { description: message.description });
    }
  }
};

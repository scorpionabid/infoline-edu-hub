import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DataEntryForm } from '@/types/dataEntry';

interface UseAutoSaveProps {
  form: DataEntryForm;
  save: (form: DataEntryForm) => Promise<boolean>;
  debounceTime?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ form, save, debounceTime = 1000, enabled = true }: UseAutoSaveProps) => {
  const { toast } = useToast();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  const debouncedSave = useCallback(async (currentForm: DataEntryForm) => {
    if (!isMounted.current) return;

    try {
      const success = await save(currentForm);
      if (success) {
        toast({
          title: "Məlumat avtomatik olaraq yadda saxlanıldı!",
          duration: 2000,
        });
      } else {
        toast({
          title: "Məlumatları yadda saxlamaq mümkün olmadı!",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Xəta baş verdi!",
        description: "Məlumatları avtomatik yadda saxlamaq mümkün olmadı.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [save, toast]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled || form.isSubmitting || form.isSubmitted) return;

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      debouncedSave(form);
    }, debounceTime);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [form, debouncedSave, debounceTime, enabled]);
};

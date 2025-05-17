import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

interface UseAutoSaveProps {
  save: () => Promise<boolean>;
  interval?: number;
  successMessage?: string;
}

export const useAutoSave = ({ save, interval = 30000, successMessage }: UseAutoSaveProps) => {
  const { formState } = useFormContext();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Set a new timeout if the form is dirty
    if (formState.isDirty) {
      saveTimeout.current = setTimeout(() => {
        saveForm();
      }, interval);
    }

    // Cleanup function to clear timeout on unmount or when dependencies change
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [formState.isDirty, interval, save]);

  const saveForm = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    let savedSuccessfully = false;

    try {
      savedSuccessfully = await save();
    } catch (error: any) {
      console.error("Auto-save failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred during auto-save.");
    } finally {
      setIsSaving(false);
    }

    // Use toast properly
    if (savedSuccessfully) {
      toast.success(successMessage || "Form auto-saved successfully", {
        description: "Your changes have been saved automatically."
      });
    } else if (errorMessage) {
      toast.error("Failed to auto-save form", {
        description: errorMessage
      });
    }
  };

  return { isSaving, errorMessage };
};

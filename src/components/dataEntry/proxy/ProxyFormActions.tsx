import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send, Loader2 } from 'lucide-react';

interface ProxyFormActionsProps {
  isSaving: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ProxyFormActions: React.FC<ProxyFormActionsProps> = ({
  isSaving,
  isSubmitting,
  hasUnsavedChanges,
  onSave,
  onSubmit
}) => {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          type="button" 
          variant="outline" 
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saxlanılır...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Yadda saxla
            </>
          )}
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Təqdim edilir...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Təqdim et
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProxyFormActions;


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { School } from '@/types/supabase';

const SchoolAdminDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, school, isSubmitting }) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('assignSchoolAdmin')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Form fields will go here */}
          <p className="text-center text-muted-foreground">{t('schoolAdminAssignmentFormUnderConstruction')}</p>
          {school && (
            <p className="text-center font-medium">{school.name}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('assigning')}
              </>
            ) : (
              t('assign')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolAdminDialog;

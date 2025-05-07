
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import CreateSchoolDialog from './CreateSchoolDialog';
import EditSchoolDialog from './EditSchoolDialog';
import DeleteSchoolDialog from './DeleteSchoolDialog';
import ImportDialog from './ImportDialog';
import AdminDialog from './school-dialogs/AdminDialog';

interface SchoolDialogsProps {
  refreshSchools: () => void;
}

export const SchoolDialogs: React.FC<SchoolDialogsProps> = ({
  refreshSchools,
}) => {
  const { t } = useLanguage();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  // Selected school
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Handle opening edit dialog
  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setEditOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteSchool = (school: School) => {
    setSelectedSchool(school);
    setDeleteOpen(true);
  };

  // Handle opening admin dialog
  const handleViewAdmin = (school: School) => {
    setSelectedSchool(school);
    setAdminDialogOpen(true);
  };

  // Reset admin password
  const handleResetPassword = async (newPassword: string) => {
    if (!selectedSchool?.admin_id) {
      toast.error(t('noAdminAssigned'));
      return;
    }

    try {
      // Supabase admin API bu client-side yoxdur, auth.admin əvəzinə RPC istifadə edə bilərsiniz
      const { error } = await supabase.rpc('reset_user_password', { 
        user_id: selectedSchool.admin_id,
        new_password: newPassword
      });

      if (error) throw error;

      toast.success(t('passwordResetSuccess'));
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(t('errorResettingPassword'), {
        description: error.message,
      });
    }
  };

  return (
    <>
      <Button onClick={() => setCreateOpen(true)}>{t('addSchool')}</Button>
      <Button variant="outline" onClick={() => setImportOpen(true)}>
        {t('import')}
      </Button>

      {/* Create School Dialog */}
      <CreateSchoolDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refreshSchools}
      />

      {/* Edit School Dialog */}
      {selectedSchool && (
        <EditSchoolDialog
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          school={selectedSchool}
          onSuccess={refreshSchools}
        />
      )}

      {/* Delete School Dialog */}
      {selectedSchool && (
        <DeleteSchoolDialog
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={refreshSchools}
          school={selectedSchool}
        />
      )}

      {/* Import Dialog */}
      <ImportDialog 
        open={importOpen} 
        onOpenChange={setImportOpen} 
        onSuccess={refreshSchools} 
      />

      {/* Admin Dialog */}
      {selectedSchool && (
        <AdminDialog
          open={adminDialogOpen}
          onClose={() => setAdminDialogOpen(false)}
          school={selectedSchool}
          onResetPassword={handleResetPassword}
        />
      )}
    </>
  );
};

export default SchoolDialogs;

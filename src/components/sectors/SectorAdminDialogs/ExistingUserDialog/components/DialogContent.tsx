
import React from 'react';
import { Form } from '@/components/ui/form';
import { Sector, FullUserData } from '@/types/supabase';
import { SectorAdminDialogHeader, SectorAdminAlert, SectorAdminUserSelector, SectorAdminDialogFooter } from '../../';
import { AdminFilters } from './AdminFilters';
import { UseFormReturn } from 'react-hook-form';

interface DialogContentProps {
  form: UseFormReturn<any>;
  sector: Sector | null;
  isEmbedded?: boolean;
  error: string | null;
  usersError: Error | null;
  filteredUsers: FullUserData[];
  loadingUsers: boolean;
  selectedUserId: string;
  assigningUser: boolean;
  showExistingAdmins: boolean;
  onUserSelect: (userId: string) => void;
  onRefresh: () => void;
  onCancel: () => void;
  onAssignAdmin: () => void;
  onCheckboxChange: (checked: boolean) => void;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  form,
  sector,
  isEmbedded = false,
  error,
  usersError,
  filteredUsers,
  loadingUsers,
  selectedUserId,
  assigningUser,
  showExistingAdmins,
  onUserSelect,
  onRefresh,
  onCancel,
  onAssignAdmin,
  // onCheckboxChange
}) => {
  return (
    <Form {...form}>
      <SectorAdminDialogHeader 
        sector={sector} 
        isEmbedded={isEmbedded} 
      />

      <SectorAdminAlert 
        error={error} 
        usersError={usersError} 
      />

      <div className="py-4 space-y-4">
        <SectorAdminUserSelector
          users={filteredUsers}
          loading={loadingUsers}
          selectedUserId={selectedUserId}
          onUserSelect={onUserSelect}
          onRefresh={onRefresh}
        />
        
        <AdminFilters
          form={form}
          showExistingAdmins={showExistingAdmins}
          onCheckboxChange={onCheckboxChange}
        />

        <SectorAdminDialogFooter
          assigningUser={assigningUser}
          selectedUserId={selectedUserId}
          onCancel={onCancel}
          onAssignAdmin={onAssignAdmin}
        />
      </div>
    </Form>
  );
};

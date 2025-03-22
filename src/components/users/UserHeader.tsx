
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserPlus } from 'lucide-react';
import { H1 } from '@/components/ui/typography';
import AddUserDialog from './AddUserDialog';

const UserHeader = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <H1>{t('usersManagement')}</H1>
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="size-4" />
          <span>{t('addUser')}</span>
        </Button>
      </div>

      <AddUserDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};

export default UserHeader;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('users') || 'İstifadəçilər'}</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createUser') || 'İstifadəçi yarat'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('userList') || 'İstifadəçi siyahısı'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('noUsers') || 'Hələ ki istifadəçi yoxdur'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

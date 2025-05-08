
import React from 'react';
import PasswordChangeForm from './account/PasswordChangeForm';
import PreferencesForm from './account/PreferencesForm';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

const AccountSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const handleUpdatePreferences = async (data: Partial<FullUserData>) => {
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      // Update the user's notification settings in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: data.notificationSettings
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update the user in the local context if updateUser is available
      if (updateUser) {
        updateUser({
          ...user,
          notificationSettings: data.notificationSettings
        });
      }
      
      return;
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
      throw error;
    }
  };
  
  return (
    <div className="space-y-6">
      <PasswordChangeForm />
      <PreferencesForm user={user as FullUserData} onSubmit={handleUpdatePreferences} />
    </div>
  );
};

export default AccountSettings;

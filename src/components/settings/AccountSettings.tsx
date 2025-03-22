
import React from 'react';
import PasswordChangeForm from './account/PasswordChangeForm';
import PreferencesForm from './account/PreferencesForm';

const AccountSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <PasswordChangeForm />
      <PreferencesForm />
    </div>
  );
};

export default AccountSettings;

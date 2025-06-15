
import React from 'react';
import { useForm } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UserFormData } from '@/types/user';

interface NotificationSectionProps {
  form: ReturnType<typeof useForm<UserFormData>>;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({ form }) => {
  const notifications = form.watch('notifications') || {};

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Bildiriş parametrləri</h3>
      
      <FormField
        control={form.control}
        name="notifications"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between space-x-2">
            <div>
              <FormLabel>Email bildirişləri</FormLabel>
              <FormDescription>Email vasitəsilə bildiriş alma</FormDescription>
            </div>
            <FormControl>
              <Switch 
                checked={notifications.email_notifications || false}
                onCheckedChange={(checked) => 
                  field.onChange({
                    ...notifications,
                    email_notifications: checked
                  })
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notifications"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between space-x-2">
            <div>
              <FormLabel>SMS bildirişləri</FormLabel>
              <FormDescription>SMS vasitəsilə bildiriş alma</FormDescription>
            </div>
            <FormControl>
              <Switch 
                checked={notifications.sms_notifications || false}
                onCheckedChange={(checked) => 
                  field.onChange({
                    ...notifications,
                    sms_notifications: checked
                  })
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default NotificationSection;

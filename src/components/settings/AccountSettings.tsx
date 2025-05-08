
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import ProfileForm from '@/components/settings/ProfileForm';
import NotificationSettingsForm from '@/components/settings/NotificationSettingsForm';
import LanguageSettingsForm from '@/components/settings/LanguageSettingsForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountSettingsSchema, AccountSettingsFormValues } from '@/types/AccountSettingsSchema';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: user?.position || '',
      language: user?.language || 'az',
      notification_settings: user?.notificationSettings || {
        email: true,
        inApp: true,
        push: true,
        system: true,
        deadline: true
      }
    },
  });

  const onSubmit = async (data: AccountSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSettingsForm form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default AccountSettings;

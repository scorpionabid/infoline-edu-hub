import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { FullUserData } from '@/types/auth';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Ad və soyad ən azı 2 simvol olmalıdır.",
  }),
  email: z.string().email({
    message: "Düzgün email formatı daxil edin.",
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
});

interface ProfileFormValues extends z.infer<typeof profileFormSchema> {}

const ProfileForm = () => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      position: user?.position || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      position: user?.position || "",
    });
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await updateProfile(data);
      if (error) {
        toast.error(`Profil yenilənərkən xəta baş verdi: ${error}`);
      } else {
        toast.success("Profil uğurla yeniləndi!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Ad və soyadınızı daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Emailinizi daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="Telefon nömrənizi daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vəzifə</FormLabel>
              <FormControl>
                <Input placeholder="Vəzifənizi daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Yenilənir..." : "Yenilə"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;

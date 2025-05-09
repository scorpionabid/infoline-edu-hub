
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { RadioGroup, RadioItem, RadioIndicator } from "@/components/ui/radio";
import { useLanguage } from '@/context/LanguageContext';

const languageFormSchema = z.object({
  language: z.string({
    required_error: "Please select a language.",
  }),
});

type LanguageFormValues = z.infer<typeof languageFormSchema>;

const LanguageSettingsForm = () => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      language: language
    },
  });

  // Update form when language changes
  useEffect(() => {
    form.setValue('language', language);
  }, [language, form]);

  function onSubmit(data: LanguageFormValues) {
    setLanguage(data.language);
    toast.success(t('languageUpdated'));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('language')}</FormLabel>
              <FormDescription>
                {t('languageDescription')}
              </FormDescription>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-1"
                >
                  {availableLanguages.map(langCode => (
                    <div key={langCode} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioItem value={langCode} id={`language-${langCode}`}>
                        <RadioIndicator />
                      </RadioItem>
                      <label
                        htmlFor={`language-${langCode}`}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {langCode === 'az' && 'Azərbaycan'}
                        {langCode === 'en' && 'English'}
                        {langCode === 'ru' && 'Русский'}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {t('saveChanges')}
        </Button>
      </form>
    </Form>
  );
};

export default LanguageSettingsForm;

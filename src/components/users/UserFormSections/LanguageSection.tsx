import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserFormData } from "@/types/user";

interface LanguageSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  form,
  data,
  onFormChange,
}) => {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name="language"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("language")}</FormLabel>
          <Select
            value={data.language || "az"}
            onValueChange={(value) => {
              field.onChange(value);
              onFormChange("language", value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t("selectLanguage")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="az">{t("azerbaijani")}</SelectItem>
              <SelectItem value="en">{t("english")}</SelectItem>
              <SelectItem value="ru">{t("russian")}</SelectItem>
              <SelectItem value="tr">{t("turkish")}</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LanguageSection;

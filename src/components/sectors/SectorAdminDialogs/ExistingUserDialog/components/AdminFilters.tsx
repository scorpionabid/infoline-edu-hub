import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface AdminFiltersProps {
  form: UseFormReturn<any>;
  showExistingAdmins: boolean;
  onCheckboxChange: (checked: boolean) => void;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  form,
  showExistingAdmins,
  onCheckboxChange,
}) => {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name="showExistingAdmins"
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2 mt-2">
          <FormControl>
            <Checkbox
              checked={showExistingAdmins}
              onCheckedChange={(checked) => onCheckboxChange(Boolean(checked))}
            />
          </FormControl>
          <div className="space-y-0 leading-none">
            <FormLabel>
              {t("showExistingAdmins") || "Mövcud adminləri göstər"}
            </FormLabel>
          </div>
        </FormItem>
      )}
    />
  );
};

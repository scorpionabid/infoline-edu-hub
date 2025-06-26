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

interface SchoolSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  filteredSchools: { id: string; name: string }[];
  hideSection?: boolean;
}

const SchoolSection: React.FC<SchoolSectionProps> = ({
  form,
  data,
  onFormChange,
  filteredSchools,
  hideSection = false,
}) => {
  const { t } = useTranslation();

  const isFiltering = !!(data.sector_id);

  if (hideSection || !(data.role === "schooladmin" && isFiltering)) {
    return null;
  }

  // Filter schools to ensure valid IDs with additional safety checks
  const validSchools = filteredSchools.filter(
    (school) =>
      school &&
      school.id &&
      String(school.id).trim() !== "" &&
      school.id !== null &&
      school.id !== undefined,
  );

  return (
    <FormField
      control={form.control}
      name="school_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("school")}</FormLabel>
          <Select
            value={data.school_id || undefined}
            onValueChange={(value) => {
              const schoolValue = value === "NONE" ? null : value;
              field.onChange(schoolValue);
              onFormChange("school_id", schoolValue);
            }}
            disabled={!isFiltering || validSchools.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t("selectSchool")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="NONE">{t("selectSchool")}</SelectItem>
              {validSchools.map((school) => (
                <SelectItem key={school.id} value={String(school.id)}>
                  {school.name || "Unknown School"}
                </SelectItem>
              ))}
              {validSchools.length === 0 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {t("noSchoolsFound") || "Məktəb tapılmadı"}
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SchoolSection;

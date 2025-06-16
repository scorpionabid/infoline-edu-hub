import React from "react";
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
import { useTranslation } from "@/contexts/TranslationContext";
import { Region } from "@/types/region";
import { Control, FieldValues, Path } from "react-hook-form";

interface RegionSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  regions: Region[];
  disabled?: boolean;
}

function RegionSection<TFieldValues extends FieldValues>({
  control,
  name = "region_id" as Path<TFieldValues>,
  regions,
  disabled = false,
}: RegionSectionProps<TFieldValues>) {
  const { t } = useTranslation();

  // Filter regions to ensure valid IDs with additional safety checks
  const validRegions = regions.filter(
    (region) =>
      region &&
      region.id &&
      String(region.id).trim() !== "" &&
      region.id !== null &&
      region.id !== undefined,
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("region")}</FormLabel>
          <FormControl>
            <Select
              value={field.value || undefined}
              onValueChange={(value) =>
                field.onChange(value === "NONE" ? null : value)
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectRegion")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("selectRegion")}</SelectItem>
                {validRegions.map((region) => (
                  <SelectItem key={region.id} value={String(region.id)}>
                    {region.name || "Unknown Region"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default RegionSection;

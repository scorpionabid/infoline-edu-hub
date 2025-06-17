import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/TranslationContext";
import { School, Region, Sector } from "@/types/school";

export interface SchoolFormProps {
  school?: Partial<School>;
  onSubmit: (data: Omit<School, "id">) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  school,
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  regionNames = {},
  sectorNames = {},
}) => {
  const { t } = useTranslation();
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    school?.region_id || "",
  );
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Omit<School, "id">>({
    defaultValues: {
      name: school?.name || "",
      region_id: school?.region_id || "",
      sector_id: school?.sector_id || "",
      address: school?.address || "",
      phone: school?.phone || "",
      email: school?.email || "",
      principal_name: school?.principal_name || "",
      student_count: school?.student_count || 0,
      teacher_count: school?.teacher_count || 0,
      type: school?.type || "",
      status: school?.status || "active",
      language: school?.language || "az",
    },
  });

  const watchedRegionId = watch("region_id");

  // Filter regions and sectors to ensure no empty IDs
  const validRegions = regions.filter(
    (region) =>
      region && region.id && String(region.id).trim() !== "" && region.name,
  );

  const validSectors = sectors.filter(
    (sector) =>
      sector && sector.id && String(sector.id).trim() !== "" && sector.name,
  );

  // Filter sectors based on selected region
  useEffect(() => {
    if (watchedRegionId) {
      const filtered = validSectors.filter(
        (sector) => sector.region_id === watchedRegionId,
      );
      setFilteredSectors(filtered);
      setSelectedRegionId(watchedRegionId);

      // Reset sector selection if current sector is not in the filtered list
      const currentSectorId = watch("sector_id");
      if (currentSectorId && !filtered.find((s) => s.id === currentSectorId)) {
        setValue("sector_id", "");
      }
    } else {
      setFilteredSectors([]);
    }
  }, [watchedRegionId, validSectors, setValue, watch]);

  const onFormSubmit = async (data: Omit<School, "id">) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t('schools.school_name')} *</Label>
          <Input
            id="name"
            {...register("name", { required: t('schools.school_name_required') })}
            placeholder={t('schools.enter_school_name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">{t('schools.school_type')}</Label>
          <Input
            id="type"
            {...register("type")}
            placeholder={t('schools.enter_school_type')}
          />
        </div>

        <div>
          <Label htmlFor="region_id">{t('schools.region')} *</Label>
          <Select
            value={watch("region_id") || undefined}
            onValueChange={(value) => setValue("region_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('schools.select_region')} />
            </SelectTrigger>
            <SelectContent>
              {validRegions.length > 0 ? (
                validRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {regionNames[region.id] || region.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-regions" disabled>
                  {t('schools.no_regions_available')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.region_id && (
            <p className="text-sm text-red-500">{errors.region_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sector_id">{t('schools.sector')} *</Label>
          <Select
            value={watch("sector_id") || undefined}
            onValueChange={(value) => setValue("sector_id", value)}
            disabled={!selectedRegionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('schools.select_sector')} />
            </SelectTrigger>
            <SelectContent>
              {filteredSectors.length > 0 ? (
                filteredSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sectorNames[sector.id] || sector.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-sectors" disabled>
                  {selectedRegionId
                    ? t('schools.no_sectors_available')
                    : t('schools.select_region_first')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.sector_id && (
            <p className="text-sm text-red-500">{errors.sector_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="principal_name">{t('schools.principal_name')}</Label>
          <Input
            id="principal_name"
            {...register("principal_name")}
            placeholder={t('schools.enter_principal_name')}
          />
        </div>

        <div>
          <Label htmlFor="phone">{t('schools.phone')}</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder={t('schools.enter_phone')}
          />
        </div>

        <div>
          <Label htmlFor="email">{t('schools.email')}</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder={t('schools.enter_email')}
          />
        </div>

        <div>
          <Label htmlFor="language">{t('schools.language')}</Label>
          <Select
            value={watch("language") || "az"}
            onValueChange={(value) => setValue("language", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">{t('schools.teaching_languages.azerbaijani')}</SelectItem>
              <SelectItem value="ru">{t('schools.teaching_languages.russian')}</SelectItem>
              <SelectItem value="tr">{t('schools.teaching_languages.turkish')}</SelectItem>
              <SelectItem value="en">{t('schools.teaching_languages.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="student_count">{t('schools.student_count')}</Label>
          <Input
            id="student_count"
            type="number"
            {...register("student_count", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="teacher_count">{t('schools.teacher_count')}</Label>
          <Input
            id="teacher_count"
            type="number"
            {...register("teacher_count", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="status">{t('schools.status')}</Label>
          <Select
            value={watch("status") || "active"}
            onValueChange={(value: "active" | "inactive") =>
              setValue("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('schools.status_options.active')}</SelectItem>
              <SelectItem value="inactive">{t('schools.status_options.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t('schools.address')}</Label>
        <Textarea
          id="address"
          {...register("address")}
          placeholder={t('schools.enter_address')}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('ui.saving') : t('ui.save')}
        </Button>
      </div>
    </form>
  );
};

export default SchoolForm;


// Tip idxallarını düzəlt
import { ColumnType } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';

// columns və editColumn proplarını əlavə et
export interface BasicColumnFieldsProps {
  form: any;
  handleTypeChange: (type: string) => void;
  selectedType: ColumnType;
  columns?: any[];
  editColumn?: boolean;
  categories?: any[];
}

const typeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Radio', value: 'radio' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'File', value: 'file' },
  { label: 'Image', value: 'image' },
];

export const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({ form, handleTypeChange, selectedType, columns, editColumn, categories }) => {
  const { t } = useLanguage();
  const { control } = useFormContext();

  return (
    <>
      <div className="grid w-full gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">{t("columnName")}</Label>
          <Input id="name" placeholder={t("columnName")} {...form.register('name')} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="type">{t("columnType")}</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-10 file:px-2 file:py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register('type')}
            onChange={(e) => {
              handleTypeChange(e.target.value);
            }}
            value={selectedType}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name="is_required"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="is_required" className="text-nowrap">
                  {t("isRequired")}
                </Label>
              </div>
            )}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="placeholder">{t("placeholderText")}</Label>
          <Input id="placeholder" placeholder={t("placeholderText")} {...form.register('placeholder')} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="help_text">{t("helpText")}</Label>
          <Textarea id="help_text" placeholder={t("helpText")} {...form.register('help_text')} />
        </div>
        {editColumn && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="order_index">{t("orderIndex")}</Label>
            <Input
              id="order_index"
              type="number"
              placeholder={t("orderIndex")}
              {...form.register('order_index', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>
    </>
  );
};

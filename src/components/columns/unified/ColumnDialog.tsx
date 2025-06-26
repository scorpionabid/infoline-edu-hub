import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Column,
  ColumnType,
  ColumnOption,
  ColumnFormData,
} from "@/types/column";
import { Category } from "@/types/category";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColumnDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ColumnFormData) => Promise<boolean>;
  column?: Column;
  categories?: Category[];
  isLoading?: boolean;
}

const COLUMN_TYPES: {
  value: ColumnType;
  label: string;
  description: string;
  supportsOptions: boolean;
}[] = [
  {
    value: "text",
    label: "Mətn",
    description: "Tək sətir mətn daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "textarea",
    label: "Çox sətirli mətn",
    description: "Çox sətirli mətn daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "number",
    label: "Rəqəm",
    description: "Rəqəm daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "email",
    label: "E-poçt",
    description: "E-poçt ünvanı daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "tel",
    label: "Telefon",
    description: "Telefon nömrəsi daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "url",
    label: "URL",
    description: "Veb səhifə ünvanı daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "password",
    label: "Şifrə",
    description: "Şifrə daxiletməsi",
    supportsOptions: false,
  },
  {
    value: "date",
    label: "Tarix",
    description: "Tarix seçici",
    supportsOptions: false,
  },
  {
    value: "datetime-local",
    label: "Tarix və Vaxt",
    description: "Tarix və vaxt seçici",
    supportsOptions: false,
  },
  {
    value: "time",
    label: "Vaxt",
    description: "Vaxt seçici",
    supportsOptions: false,
  },
  {
    value: "select",
    label: "Seçim",
    description: "Açılan siyahı seçimi",
    supportsOptions: true,
  },
  {
    value: "radio",
    label: "Radio düymələr",
    description: "Radio düymə qrupu",
    supportsOptions: true,
  },
  {
    value: "checkbox",
    label: "Qutu işarələri",
    description: "Tək və ya çoxlu qutu işarələri",
    supportsOptions: true,
  },
  {
    value: "switch",
    label: "Aç/Bağla",
    description: "Aç/bağla düyməsi",
    supportsOptions: false,
  },
  {
    value: "file",
    label: "Fayl",
    description: "Fayl yükləməsi",
    supportsOptions: false,
  },
  {
    value: "boolean",
    label: "Bəli/Xeyr",
    description: "Doğru/yalan dəyər",
    supportsOptions: false,
  },
];

const ColumnDialog: React.FC<ColumnDialogProps> = ({
  mode,
  open,
  onOpenChange,
  onSave,
  column,
  categories = [],
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<ColumnFormData>({
    name: "",
    type: "text",
    category_id: "",
    is_required: false,
    placeholder: "",
    help_text: "",
    default_value: "",
    options: [],
    validation: {},
    order_index: 0,
    status: "active",
  });

  // Options management
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  // Initialize form data when dialog opens or column changes
  useEffect(() => {
    if (mode === "edit" && column) {
      setFormData({
        name: column.name || "",
        type: column.type || "text",
        category_id: column.category_id || "",
        is_required: column.is_required || false,
        placeholder: column.placeholder || "",
        help_text: column.help_text || "",
        default_value: column.default_value || "",
        options: column.options || [],
        validation: column.validation || {},
        order_index: column.order_index || 0,
        status: column.status || "active",
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        name: "",
        type: "text",
        category_id: categories.length > 0 ? categories[0].id : "",
        is_required: false,
        placeholder: "",
        help_text: "",
        default_value: "",
        options: [],
        validation: {},
        order_index: 0,
        status: "active",
      });
    }
  }, [mode, column, categories, open]);

  // Check if current type supports options
  const selectedTypeInfo = COLUMN_TYPES.find(
    (type) => type.value === formData.type,
  );
  const supportsOptions = selectedTypeInfo?.supportsOptions || false;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category_id) {
      return;
    }

    const success = await onSave(formData);

    if (success) {
      // Reset form for create mode
      if (mode === "create") {
        setFormData({
          name: "",
          type: "text",
          category_id: categories.length > 0 ? categories[0].id : "",
          is_required: false,
          placeholder: "",
          help_text: "",
          default_value: "",
          options: [],
          validation: {},
          order_index: 0,
          status: "active",
        });
      }
      onOpenChange(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof ColumnFormData>(
    field: K,
    value: ColumnFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add option for select/radio/checkbox types
  const handleAddOption = () => {
    if (newOption.value.trim() && newOption.label.trim()) {
      const updatedOptions = [...(formData.options || []), newOption];
      updateField("options", updatedOptions);
      setNewOption({ value: "", label: "" });
    }
  };

  // Remove option
  const handleRemoveOption = (index: number) => {
    const updatedOptions = (formData.options || []).filter(
      (_, i) => i !== index,
    );
    updateField("options", updatedOptions);
  };

  // Handle type change (clear options if new type doesn't support them)
  const handleTypeChange = (newType: ColumnType) => {
    const newTypeInfo = COLUMN_TYPES.find((type) => type.value === newType);
    const newFormData = { ...formData, type: newType };

    // Clear options if new type doesn't support them
    if (!newTypeInfo?.supportsOptions) {
      newFormData.options = [];
    }

    setFormData(newFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("columns.createColumn") : t("columns.editColumn")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("columns.columnName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={t("columns.enterColumnName")}
                // required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("columns.category")} *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => updateField("category_id", value)}
                disabled={mode === "edit"} // Don't allow category change in edit mode
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("columns.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column Type */}
          <div className="space-y-2">
            <Label htmlFor="type">{t("columns.columnType")} *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTypeInfo && (
              <p className="text-sm text-muted-foreground">
                {selectedTypeInfo.description}
              </p>
            )}
          </div>

          {/* Options for select/radio/checkbox types */}
          {supportsOptions && (
            <div className="space-y-4">
              <Label>{t("columns.options")}</Label>

              {/* Existing options */}
              {formData.options && formData.options.length > 0 && (
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <Badge variant="outline">{option.value}</Badge>
                      <span className="flex-1">{option.label}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new option */}
              <div className="flex gap-2">
                <Input
                  placeholder={t("columns.optionValue")}
                  value={newOption.value}
                  onChange={(e) =>
                    setNewOption((prev) => ({ ...prev, value: e.target.value }))
                  }
                />
                <Input
                  placeholder={t("columns.optionLabel")}
                  value={newOption.label}
                  onChange={(e) =>
                    setNewOption((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOption}
                  disabled={!newOption.value.trim() || !newOption.label.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placeholder">{t("columns.placeholder")}</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => updateField("placeholder", e.target.value)}
                placeholder={t("columns.enterPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_value">{t("columns.defaultValue")}</Label>
              <Input
                id="default_value"
                value={formData.default_value}
                onChange={(e) => updateField("default_value", e.target.value)}
                placeholder={t("columns.enterDefaultValue")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="help_text">{t("columns.helpText")}</Label>
            <Textarea
              id="help_text"
              value={formData.help_text}
              onChange={(e) => updateField("help_text", e.target.value)}
              placeholder={t("columns.enterHelpText")}
              rows={3}
            />
          </div>

          {/* Required Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => updateField("is_required", checked)}
            />
            <Label htmlFor="is_required">{t("columns.required")}</Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("columns.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !formData.name.trim() || !formData.category_id
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? t("columns.creating") : t("columns.updating")}
                </>
              ) : mode === "create" ? (
                t("columns.create")
              ) : (
                t("columns.update")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;

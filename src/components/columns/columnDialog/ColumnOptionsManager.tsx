import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface ColumnOption {
  value: string;
  label: string;
}

interface ColumnOptionsManagerProps {
  options: ColumnOption[];
  newOption: ColumnOption;
  onNewOptionChange: (field: "value" | "label", value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

const ColumnOptionsManager: React.FC<ColumnOptionsManagerProps> = ({
  options,
  newOption,
  onNewOptionChange,
  onAddOption,
  onRemoveOption,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Label>{t("options")}</Label>

      {/* Existing options */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={option.value}
              placeholder={t("optionValue")}
              className="flex-1"
              // readOnly
            />
            <Input
              value={option.label}
              placeholder={t("optionLabel")}
              className="flex-1"
              // readOnly
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveOption(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new option */}
      <div className="flex items-center space-x-2">
        <Input
          value={newOption.value}
          onChange={(e) => onNewOptionChange("value", e.target.value)}
          placeholder={t("optionValue")}
          className="flex-1"
        />
        <Input
          value={newOption.label}
          onChange={(e) => onNewOptionChange("label", e.target.value)}
          placeholder={t("optionLabel")}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddOption}
          disabled={!newOption.value || !newOption.label}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ColumnOptionsManager;

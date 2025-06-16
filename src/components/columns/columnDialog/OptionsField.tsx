import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { ColumnOption } from "@/types/column";
import { useTranslation } from "@/contexts/TranslationContext";

export interface OptionsFieldProps {
  control: Control<any>;
  options?: ColumnOption[];
  newOption?: Partial<ColumnOption>;
  setNewOption?: (value: Partial<ColumnOption>) => void;
  addOption?: () => void;
  removeOption?: (id: string) => void;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options = [],
  newOption = { label: "", value: "" },
  setNewOption = () => {},
  addOption: externalAddOption,
  removeOption: externalRemoveOption,
}) => {
  const { t } = useTranslation();
  const [localNewOption, setLocalNewOption] = useState<Partial<ColumnOption>>({
    label: "",
    value: "",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const currentNewOption = externalAddOption ? newOption : localNewOption;
  const setCurrentNewOption = externalAddOption
    ? setNewOption
    : setLocalNewOption;

  const addOption = () => {
    if (externalAddOption) {
      externalAddOption();
      return;
    }

    if (currentNewOption.label?.trim() && currentNewOption.value?.trim()) {
      const newOptionWithId: ColumnOption = {
        id: crypto.randomUUID(),
        label: currentNewOption.label.trim(),
        value: currentNewOption.value.trim(),
      };
      append(newOptionWithId);
      setCurrentNewOption({ label: "", value: "" });
    }
  };

  const removeOptionHandler = (index: number) => {
    if (externalRemoveOption) {
      const option = fields[index] as ColumnOption;
      if (option.id) {
        externalRemoveOption(option.id);
      }
      return;
    }
    remove(index);
  };

  return (
    <FormField
      control={control}
      name="options"
      render={() => (
        <FormItem>
          <FormLabel>{t("options")}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t("optionLabel")}
                  value={currentNewOption.label || ""}
                  onChange={(e) =>
                    setCurrentNewOption({
                      ...currentNewOption,
                      label: e.target.value,
                    })
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addOption())
                  }
                />
                <div className="flex space-x-2">
                  <Input
                    placeholder={t("optionValue")}
                    value={currentNewOption.value || ""}
                    onChange={(e) =>
                      setCurrentNewOption({
                        ...currentNewOption,
                        value: e.target.value,
                      })
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addOption())
                    }
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => {
                  const option = field as ColumnOption;
                  return (
                    <Badge
                      key={option.id || index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{option.label}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeOptionHandler(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OptionsField;

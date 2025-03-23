
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { X, Plus } from "lucide-react";

interface OptionsFieldProps {
  options: string[];
  newOption: string;
  setNewOption: (value: string) => void;
  addOption: () => void;
  removeOption: (option: string) => void;
  t: (key: string) => string;
}

const OptionsField = ({
  options,
  newOption,
  setNewOption,
  addOption,
  removeOption,
  t
}: OptionsFieldProps) => {
  return (
    <div className="col-span-2">
      <FormLabel>{t("options")}</FormLabel>
      <div className="flex space-x-2 mb-2">
        <Input
          placeholder={t("enterOption")}
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />
        <Button type="button" onClick={addOption}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
          >
            <span>{option}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-1 hover:bg-secondary-foreground/20"
              onClick={() => removeOption(option)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      {options.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("noOptionsAdded")}
        </p>
      )}
    </div>
  );
};

export default OptionsField;

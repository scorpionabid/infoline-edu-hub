
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { X, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OptionsFieldProps {
  options: string[];
  newOption: string;
  setNewOption: (value: string) => void;
  addOption: () => void;
  removeOption: (option: string) => void;
  t: (key: string) => string;
  maxOptions?: number;
}

const OptionsField = ({
  options,
  newOption,
  setNewOption,
  addOption,
  removeOption,
  t,
  maxOptions = 100
}: OptionsFieldProps) => {
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleAdd = () => {
    if (newOption.trim() === '') return;
    
    if (options.includes(newOption.trim())) {
      setDuplicateWarning(true);
      setTimeout(() => setDuplicateWarning(false), 3000);
      return;
    }
    
    if (options.length >= maxOptions) {
      return;
    }
    
    addOption();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  return (
    <div className="col-span-2">
      <FormLabel>{t("options")}</FormLabel>
      <div className="flex space-x-2 mb-2">
        <Input
          ref={inputRef}
          placeholder={t("enterOption")}
          value={newOption}
          onChange={(e) => {
            setNewOption(e.target.value);
            setDuplicateWarning(false);
          }}
          onKeyDown={handleKeyDown}
          disabled={options.length >= maxOptions}
        />
        <Button 
          type="button" 
          onClick={handleAdd}
          disabled={newOption.trim() === '' || options.length >= maxOptions}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {duplicateWarning && (
        <Alert variant="destructive" className="mt-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("duplicateOptionWarning")}
          </AlertDescription>
        </Alert>
      )}
      
      {options.length >= maxOptions && (
        <Alert className="mt-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("maxOptionsReached", { max: maxOptions })}
          </AlertDescription>
        </Alert>
      )}
      
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
      
      {options.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("optionsCount", { count: options.length, max: maxOptions })}
        </p>
      )}
    </div>
  );
};

export default OptionsField;

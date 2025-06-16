import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface FileInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  value,
  onChange,
  accept,
  required,
  multiple = false,
  disabled = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        className={`w-full text-left justify-start ${className}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {!value ? (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {t("uploadFile")}
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="truncate">{value.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("clear")}</span>
            </Button>
          </div>
        )}
      </Button>
    </div>
  );
};

export default FileInput;

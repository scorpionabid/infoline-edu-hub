import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColumnOption } from "@/types/column";
import { Control, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, Save, X, Import } from "lucide-react";
import { toast } from "sonner";

interface OptionsFieldProps {
  control: Control<any>;
  options: ColumnOption[];
  newOption: string;
  setNewOption: (value: string) => void;
  addOption: (option: string) => void;
  removeOption: (index: number) => void;
  updateOption?: (oldOption: ColumnOption, newOption: ColumnOption) => boolean;
}

const OptionsField: React.FC<OptionsFieldProps> = ({
  control,
  options,
  newOption,
  setNewOption,
  addOption,
  removeOption,
  updateOption
}) => {
  const { t } = useLanguage();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("manual");

  // useFieldArray hook-u ilə options sahəsini idarə edirik
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "options"
  });

  // Options dəyişdikdə form sahəsini yeniləyirik
  useEffect(() => {
    console.log("Options changed in OptionsField:", options);
  }, [options]);

  // Yeni option əlavə etmə funksiyası
  const handleAddOption = () => {
    if (newOption.trim()) {
      addOption(newOption.trim());
    }
  };

  // Option silmə funksiyası
  const handleRemoveOption = (index: number) => {
    removeOption(index);
    remove(index);
  };

  // Option redaktə etmə funksiyası
  const handleEditOption = (index: number) => {
    setEditingIndex(index);
    setEditValue(options[index]?.label || "");
  };

  // Option redaktəsini yadda saxlama funksiyası
  const handleSaveEdit = (index: number) => {
    if (editValue.trim()) {
      const oldOption = options[index];
      const newOption = { ...oldOption, label: editValue.trim(), value: editValue.trim() };
      
      // Əgər updateOption prop-u təmin edilibsə, onu çağırırıq
      if (updateOption) {
        const success = updateOption(oldOption, newOption);
        if (success) {
          update(index, newOption);
          toast.success(t("optionUpdated"));
        } else {
          toast.error(t("failedToUpdateOption"));
        }
      } else {
        // Əks halda birbaşa update edirik
        update(index, newOption);
      }
      
      setEditingIndex(null);
      setEditValue("");
    }
  };

  // Option redaktəsini ləğv etmə funksiyası
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  // JSON formatını import etmə funksiyası
  const handleImportJSON = () => {
    if (!jsonInput.trim()) {
      toast.error(t("emptyJSONInput"));
      return;
    }

    try {
      console.log("Importing JSON:", jsonInput);
      
      // Xüsusi simvolları düzəldirik
      let cleanedInput = jsonInput
        .replace(/\\"/g, '"') // Escape edilmiş dırnaqları düzəldirik
        .replace(/(\w+):/g, '"$1":') // Dırnaqsız açarları dırnaqlı edirik
        .replace(/'/g, '"'); // Tək dırnaqları cüt dırnaqlara çeviririk
      
      // Əgər array deyilsə, array-ə çeviririk
      if (!cleanedInput.trim().startsWith('[')) {
        cleanedInput = `[${cleanedInput}]`;
      }
      
      // JSON kimi parse etməyə çalışırıq
      let parsedOptions: any[] = [];
      
      try {
        parsedOptions = JSON.parse(cleanedInput);
        console.log("Successfully parsed JSON:", parsedOptions);
      } catch (e) {
        console.error("Failed to parse JSON directly:", e);
        
        // Alternativ parsing metodları
        try {
          // Əgər obyekt formatındadırsa
          if (cleanedInput.trim().startsWith('{')) {
            const obj = JSON.parse(cleanedInput);
            parsedOptions = Object.entries(obj).map(([key, value]) => ({
              label: String(value),
              value: key
            }));
          } else {
            // Vergüllə ayrılmış siyahı kimi qəbul edirik
            parsedOptions = jsonInput.split(',')
              .map(opt => opt.trim())
              .filter(opt => opt)
              .map(opt => ({ label: opt, value: opt }));
          }
          console.log("Parsed using alternative method:", parsedOptions);
        } catch (e2) {
          console.error("All parsing methods failed:", e2);
          throw new Error("Invalid JSON format");
        }
      }
      
      // Hər bir option-u düzgün formata çeviririk
      const formattedOptions = parsedOptions.map(option => {
        if (typeof option === 'string') {
          return { label: option, value: option };
        }
        
        // Əgər obyektdirsə, label və value-nu təmin edirik
        return {
          label: option.label || option.name || String(option.value || option),
          value: String(option.value !== undefined ? option.value : (option.id || option.label || option)),
          description: option.description,
          icon: option.icon,
          disabled: option.disabled
        };
      });
      
      console.log("Formatted options:", formattedOptions);
      
      // Mövcud options-ları təmizləyirik
      while (fields.length > 0) {
        remove(0);
      }
      
      // Yeni options-ları əlavə edirik
      formattedOptions.forEach(opt => {
        append(opt);
        addOption(opt.label);
      });
      
      // JSON input-u təmizləyirik və manual tab-a keçirik
      setJsonInput("");
      setActiveTab("manual");
      
      toast.success(t("optionsImported", { count: formattedOptions.length }));
    } catch (error) {
      console.error("Error importing JSON:", error);
      toast.error(t("invalidJSONFormat"));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("options")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">{t("manualEntry")}</TabsTrigger>
            <TabsTrigger value="json">{t("jsonImport")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder={t("enterOption")}
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
              />
              <Button type="button" onClick={handleAddOption} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("add")}
              </Button>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>{t("currentOptions")}</Label>
              {options.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noOptionsAdded")}</p>
              ) : (
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {editingIndex === index ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(index)}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleSaveEdit(index)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 p-2 border rounded-md">
                            {option.label}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditOption(index)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jsonInput">{t("pasteJSONOptions")}</Label>
              <Textarea
                id="jsonInput"
                placeholder={`[
  {"label": "Option 1", "value": "option1"},
  {"label": "Option 2", "value": "option2"}
]`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {t("jsonFormatHint")}
              </p>
            </div>
            <Button type="button" onClick={handleImportJSON}>
              <Import className="h-4 w-4 mr-1" />
              {t("importJSON")}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <FormField
          control={control}
          name="options"
          render={() => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardFooter>
    </Card>
  );
};

export default OptionsField;

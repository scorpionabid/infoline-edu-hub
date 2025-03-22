
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Column, ColumnType } from "@/types/column";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (newColumn: Omit<Column, "id">) => Promise<boolean>;
  categories: { id: string; name: string }[];
  editColumn?: Column; // For edit mode
  columns?: Column[]; // For parent column selection
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  categories,
  editColumn,
  columns = [],
}) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<ColumnType>("text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const isEditMode = !!editColumn;

  // Define form schema with Zod
  const formSchema = z.object({
    name: z.string().min(1, { message: t("columnNameRequired") }),
    categoryId: z.string().min(1, { message: t("categoryRequired") }),
    type: z.enum(["text", "number", "date", "select", "checkbox", "radio", "file", "image"]),
    isRequired: z.boolean().default(false),
    validationRules: z.object({
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      format: z.string().optional(),
      regex: z.string().optional(),
    }).optional(),
    defaultValue: z.string().optional(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    deadline: z.date().optional(),
    order: z.number().positive().int(),
    parentColumnId: z.string().optional(),
    status: z.enum(["active", "inactive"]).default("active"),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      type: "text",
      isRequired: false,
      validationRules: {
        minValue: undefined,
        maxValue: undefined,
        format: "",
        regex: "",
      },
      defaultValue: "",
      placeholder: "",
      helpText: "",
      deadline: undefined,
      order: 1,
      parentColumnId: undefined,
      status: "active",
    },
  });

  // Set form values when in edit mode
  useEffect(() => {
    if (isEditMode && editColumn) {
      setSelectedType(editColumn.type);
      
      if (editColumn.options) {
        setOptions(editColumn.options);
      }
      
      form.reset({
        name: editColumn.name,
        categoryId: editColumn.categoryId,
        type: editColumn.type,
        isRequired: editColumn.isRequired,
        validationRules: editColumn.validationRules,
        defaultValue: editColumn.defaultValue || "",
        placeholder: editColumn.placeholder || "",
        helpText: editColumn.helpText || "",
        deadline: editColumn.deadline ? new Date(editColumn.deadline) : undefined,
        order: editColumn.order,
        parentColumnId: editColumn.parentColumnId,
        status: editColumn.status,
      });
    } else {
      setSelectedType("text");
      setOptions([]);
      form.reset({
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        type: "text",
        isRequired: false,
        validationRules: {
          minValue: undefined,
          maxValue: undefined,
          format: "",
          regex: "",
        },
        defaultValue: "",
        placeholder: "",
        helpText: "",
        deadline: undefined,
        order: 1,
        parentColumnId: undefined,
        status: "active",
      });
    }
  }, [isEditMode, editColumn, form, categories]);

  // Handle type change
  const handleTypeChange = (value: string) => {
    setSelectedType(value as ColumnType);
    form.setValue("type", value as ColumnType);
  };

  // Handle adding a new option
  const addOption = () => {
    if (newOption.trim() !== "" && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  // Handle removing an option
  const removeOption = (option: string) => {
    setOptions(options.filter((o) => o !== option));
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Add options to the form values for select, checkbox, and radio types
      const columnData: Omit<Column, "id"> = {
        ...values,
        options: ["select", "checkbox", "radio"].includes(values.type) ? options : undefined,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
      };

      if (await onAddColumn(columnData)) {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editColumn") : t("addColumn")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("columnName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterColumnName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCategory")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Column Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("columnType")}</FormLabel>
                    <Select
                      onValueChange={(value) => handleTypeChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">{t("text")}</SelectItem>
                        <SelectItem value="number">{t("number")}</SelectItem>
                        <SelectItem value="date">{t("date")}</SelectItem>
                        <SelectItem value="select">{t("select")}</SelectItem>
                        <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
                        <SelectItem value="radio">{t("radio")}</SelectItem>
                        <SelectItem value="file">{t("file")}</SelectItem>
                        <SelectItem value="image">{t("image")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Required Field */}
              <FormField
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t("required")}</FormLabel>
                      <FormDescription>
                        {t("requiredFieldDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Order */}
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("order")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("enterOrder")}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Column (if any) */}
              <FormField
                control={form.control}
                name="parentColumnId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("parentColumn")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectParentColumn")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t("noParent")}</SelectItem>
                        {columns
                          .filter(col => col.id !== editColumn?.id) // Filter out the current column in edit mode
                          .map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("parentColumnDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Placeholder */}
              <FormField
                control={form.control}
                name="placeholder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("placeholder")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Help Text */}
              <FormField
                control={form.control}
                name="helpText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("helpText")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("enterHelpText")} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("helpTextDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("deadline")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t("selectDeadline")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {t("deadlineDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Value */}
              {(selectedType === "text" || selectedType === "number") && (
                <FormField
                  control={form.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("defaultValue")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("enterDefaultValue")}
                          type={selectedType === "number" ? "number" : "text"}
                          {...field}
                          onChange={(e) => 
                            field.onChange(selectedType === "number" ? 
                              (e.target.value === "" ? "" : String(parseFloat(e.target.value) || 0)) : 
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Options for select, checkbox, radio */}
              {(selectedType === "select" || selectedType === "checkbox" || selectedType === "radio") && (
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
              )}

              {/* Validation Rules for number */}
              {selectedType === "number" && (
                <>
                  <FormField
                    control={form.control}
                    name="validationRules.minValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("minValue")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t("enterMinValue")}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validationRules.maxValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("maxValue")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t("enterMaxValue")}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Format for text */}
              {selectedType === "text" && (
                <FormField
                  control={form.control}
                  name="validationRules.format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("format")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectFormat")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">{t("noFormat")}</SelectItem>
                          <SelectItem value="email">{t("email")}</SelectItem>
                          <SelectItem value="phone">{t("phone")}</SelectItem>
                          <SelectItem value="url">{t("url")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Regex for text */}
              {selectedType === "text" && (
                <FormField
                  control={form.control}
                  name="validationRules.regex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("regex")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("enterRegex")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("regexDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("status")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="inactive">{t("inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="submit">
                {isEditMode ? t("saveChanges") : t("addColumn")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;

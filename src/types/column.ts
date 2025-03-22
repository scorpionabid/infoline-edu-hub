
export type ColumnType = 
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "image";

export type Column = {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  isRequired: boolean;
  validationRules?: {
    minValue?: number;
    maxValue?: number;
    format?: string;
    regex?: string;
  };
  defaultValue?: string;
  options?: string[]; // for select, checkbox, radio types
  placeholder?: string;
  helpText?: string;
  deadline?: string;
  order: number;
  parentColumnId?: string;
  conditionalDisplay?: {
    columnId: string;
    value: string;
  };
  status: "active" | "inactive";
};

export type CategoryWithColumns = {
  id: string;
  name: string;
  columns: Column[];
};

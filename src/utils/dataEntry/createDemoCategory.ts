
import { CategoryWithColumns, Column, ColumnType } from "@/types/column";
import { ValidationRules } from "@/types/dataEntry";

/**
 * Demo kateqoriya yaradır
 */
export const createDemoCategory = (id: string, name: string): CategoryWithColumns => {
  return {
    id,
    name,
    description: "Bu bir demo kateqoriyadır",
    assignment: "all",
    priority: 1,
    deadline: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    status: "active",
    columnCount: 5,
    order: 1,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    columns: createDemoColumns(id)
  };
};

/**
 * Demo kateqoriya üçün sütunlar yaradır
 */
const createDemoColumns = (categoryId: string): Column[] => {
  const columns: Column[] = [
    {
      id: `${categoryId}-col-1`,
      categoryId,
      name: "Şagirdlərin sayı",
      type: "number" as ColumnType,
      isRequired: true,
      order: 0,
      orderIndex: 0,
      status: "active",
      helpText: "Məktəbdəki ümumi şagird sayını daxil edin",
      validation: {
        minValue: 0,
        maxValue: 5000
      }
    },
    {
      id: `${categoryId}-col-2`,
      categoryId,
      name: "Qeyd",
      type: "textarea" as ColumnType,
      isRequired: false,
      order: 1,
      orderIndex: 1,
      status: "active",
      helpText: "Əlavə qeydlər"
    },
    {
      id: `${categoryId}-col-3`,
      categoryId,
      name: "Keçid balı",
      type: "number" as ColumnType,
      isRequired: true,
      order: 2,
      orderIndex: 2,
      status: "active",
      helpText: "Minimal keçid balını daxil edin",
      defaultValue: "51",
      placeholder: "51",
      validation: {
        minValue: 0,
        maxValue: 100
      }
    },
    {
      id: `${categoryId}-col-4`,
      categoryId,
      name: "Təhsil növü",
      type: "select" as ColumnType,
      isRequired: true,
      order: 3,
      orderIndex: 3,
      status: "active",
      helpText: "Təhsil növünü seçin",
      options: [
        { label: "Tam orta təhsil", value: "full_secondary" },
        { label: "Ümumi orta təhsil", value: "general_secondary" },
        { label: "İbtidai təhsil", value: "primary" },
        { label: "Məktəbəqədər təhsil", value: "preschool" },
        { label: "Digər", value: "other" }
      ]
    },
    {
      id: `${categoryId}-col-5`,
      categoryId,
      name: "Son müraciət tarixi",
      type: "date" as ColumnType,
      isRequired: true,
      order: 4,
      orderIndex: 4,
      status: "active",
      helpText: "Müraciət üçün son tarixi daxil edin",
      validation: {
        minDate: new Date().toISOString(),
        maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      }
    },
    {
      id: `${categoryId}-col-6`,
      categoryId,
      name: "Büdcə",
      type: "number" as ColumnType,
      isRequired: true,
      order: 5,
      orderIndex: 5,
      status: "active",
      helpText: "İllik büdcəni daxil edin (AZN)",
      validation: {
        minValue: 10000,
        maxValue: 1000000
      }
    }
  ];
  
  return columns;
};

/**
 * Demo veriləri yaradır
 */
export const createDemoData = (categoryId: string, columns: Column[]) => {
  return columns.map(column => ({
    columnId: column.id,
    value: getDefaultValueForColumn(column),
    status: "pending"
  }));
};

/**
 * Sütun tipinə əsasən default dəyər yaradır
 */
const getDefaultValueForColumn = (column: Column) => {
  switch (column.type) {
    case "number":
      return column.name.toLowerCase().includes("say") ? "150" : "50";
    case "text":
      return "Mətn dəyəri";
    case "textarea":
      return "Bu sahədə ətraflı məlumat veriləcək...";
    case "select":
      return (column.options && Array.isArray(column.options) && column.options.length > 0) 
        ? column.options[0].value || column.options[0]
        : "";
    case "date":
      return new Date().toISOString().split("T")[0];
    case "checkbox":
      return true;
    default:
      return "";
  }
};

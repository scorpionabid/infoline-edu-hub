
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Column } from "@/types/column";
import { Database, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import DataTable from "@/components/common/DataTable";

interface ColumnListProps {
  columns: Column[];
  categories: { id: string; name: string }[];
  isLoading: boolean;
  isError: boolean;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (id: string) => Promise<any>;
  onUpdateStatus: (id: string, status: "active" | "inactive") => Promise<any>;
}

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  categories,
  isLoading,
  isError,
  onEditColumn,
  onDeleteColumn,
  onUpdateStatus,
}) => {
  const { t, language } = useLanguage();
  const canManageColumns = useRole(["superadmin", "regionadmin"]);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : t("unknownCategory");
  };

  // Handle status toggle
  const handleStatusToggle = async (column: Column) => {
    if (!canManageColumns) return;
    
    const newStatus = column.status === "active" ? "inactive" : "active";
    await onUpdateStatus(column.id, newStatus);
  };

  const tableColumns = [
    {
      key: "order",
      header: "#",
      className: "w-[40px]",
      cell: (column: Column) => <span className="font-medium">{column.order}</span>
    },
    {
      key: "name",
      header: t("columnName"),
      cell: (column: Column) => <span className="font-medium">{column.name}</span>
    },
    {
      key: "category",
      header: t("category"),
      cell: (column: Column) => getCategoryName(column.categoryId)
    },
    {
      key: "type",
      header: t("type"),
      cell: (column: Column) => (
        <Badge variant="outline">
          {t(column.type)}
        </Badge>
      )
    },
    {
      key: "required",
      header: t("required"),
      cell: (column: Column) => (
        column.isRequired ? (
          <Badge variant="default">
            {t("required")}
          </Badge>
        ) : (
          <Badge variant="outline">
            {t("optional")}
          </Badge>
        )
      )
    },
    {
      key: "status",
      header: t("status"),
      cell: (column: Column) => (
        canManageColumns ? (
          <Switch
            checked={column.status === "active"}
            onCheckedChange={() => handleStatusToggle(column)}
          />
        ) : (
          <Badge variant={column.status === "active" ? "success" : "destructive"}>
            {column.status === "active" ? t("active") : t("inactive")}
          </Badge>
        )
      )
    }
  ];

  return (
    <DataTable 
      data={columns}
      columns={tableColumns}
      isLoading={isLoading}
      isError={isError}
      emptyState={{
        icon: <Database className="h-16 w-16 text-muted-foreground mb-4" />,
        title: t("noColumnsFound"),
        description: t("noColumnsFoundDesc")
      }}
      actionColumn={canManageColumns ? {
        canManage: true,
        actions: [
          {
            icon: <Edit className="mr-2 h-4 w-4" />,
            label: t("edit"),
            onClick: (column) => onEditColumn(column)
          },
          {
            icon: <Trash className="mr-2 h-4 w-4" />,
            label: t("delete"),
            variant: "destructive",
            onClick: (column) => setColumnToDelete(column.id)
          }
        ]
      } : undefined}
      deleteDialog={{
        title: t("deleteColumn"),
        description: t("deleteColumnConfirmation"),
        itemToDelete: columnToDelete,
        setItemToDelete: setColumnToDelete,
        onDelete: onDeleteColumn
      }}
    />
  );
};

export default ColumnList;


import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Category } from "@/types/category";
import { FileText, Layers, Trash, Edit, Eye, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onUpdateStatus: (id: string, status: "active" | "inactive") => Promise<boolean>;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading,
  isError,
  onDeleteCategory,
  onUpdateStatus,
}) => {
  const { t } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  const handleStatusChange = async (category: Category) => {
    try {
      const newStatus = category.status === "active" ? "inactive" : "active";
      const success = await onUpdateStatus(category.id, newStatus);
      
      if (success) {
        toast.success(
          newStatus === "active" 
            ? t('categoryActivated') 
            : t('categoryDeactivated'), 
          {
            description: t('categoryStatusUpdatedSuccess')
          }
        );
      } else {
        toast.error(t('categoryStatusUpdateFailed'));
      }
    } catch (error) {
      console.error("Status dəyişdirmə xətası:", error);
      toast.error(t('categoryStatusUpdateFailed'));
    }
  };

  const columns = [
    {
      key: "priority",
      header: "#",
      className: "w-[40px]",
      cell: (category: Category) => <span className="font-medium">{category.priority}</span>
    },
    {
      key: "name",
      header: t("categoryName"),
      cell: (category: Category) => <span className="font-medium">{category.name}</span>
    },
    {
      key: "assignment",
      header: t("assignment"),
      cell: (category: Category) => (
        <Badge variant={category.assignment === "all" ? "default" : "secondary"}>
          {category.assignment === "all" ? t("allUsers") : t("sectorsOnly")}
        </Badge>
      )
    },
    {
      key: "columnCount",
      header: t("columnCount"),
      cell: (category: Category) => <span>{category.columnCount || 0}</span>
    },
    {
      key: "status",
      header: t("status"),
      cell: (category: Category) => (
        <div className="flex items-center">
          {category.status === "active" ? (
            <Badge variant="success" className="flex items-center gap-1">
              <Power className="h-3 w-3" />
              {t("active")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <PowerOff className="h-3 w-3" />
              {t("inactive")}
            </Badge>
          )}
          {canManageCategories && (
            <Switch 
              checked={category.status === "active"}
              onCheckedChange={() => handleStatusChange(category)}
              className="ml-2"
              size="sm"
            />
          )}
        </div>
      ),
      className: "w-[150px]"
    }
  ];

  return (
    <DataTable 
      data={categories}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyState={{
        icon: <Layers className="h-16 w-16 text-muted-foreground mb-4" />,
        title: t("noCategoriesFound"),
        description: t("noCategoriesFoundDesc")
      }}
      actionColumn={canManageCategories ? {
        canManage: true,
        actions: [
          {
            icon: <Eye className="mr-2 h-4 w-4" />,
            label: t("viewColumns"),
            onClick: (category) => console.log("View columns", category.id)
          },
          {
            icon: <Edit className="mr-2 h-4 w-4" />,
            label: t("edit"),
            onClick: (category) => console.log("Edit category", category.id)
          },
          {
            icon: <Trash className="mr-2 h-4 w-4" />,
            label: t("delete"),
            variant: "destructive",
            onClick: (category) => setCategoryToDelete(category.id)
          }
        ]
      } : undefined}
      deleteDialog={{
        title: t("deleteCategory"),
        description: t("deleteCategoryConfirmation"),
        itemToDelete: categoryToDelete,
        setItemToDelete: setCategoryToDelete,
        onDelete: onDeleteCategory
      }}
    />
  );
};

export default CategoryList;

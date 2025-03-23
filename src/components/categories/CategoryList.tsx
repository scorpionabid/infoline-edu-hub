
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Category } from "@/types/category";
import { formatDistanceToNow } from "date-fns";
import { az, ru, tr, enUS } from "date-fns/locale";
import { FileText, Layers, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import DataTable from "@/components/common/DataTable";

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
  const { t, language } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  // Format date relative to now
  const formatDate = (dateString: string) => {
    try {
      const getLocale = () => {
        switch (language) {
          case "az": return az;
          case "ru": return ru;
          case "tr": return tr;
          default: return enUS;
        }
      };
      
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: getLocale(),
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (category: Category) => {
    if (!canManageCategories) return;
    
    const newStatus = category.status === "active" ? "inactive" : "active";
    await onUpdateStatus(category.id, newStatus);
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
      key: "createdAt",
      header: t("createdAt"),
      cell: (category: Category) => formatDate(category.createdAt)
    },
    {
      key: "updatedAt",
      header: t("lastUpdated"),
      cell: (category: Category) => formatDate(category.updatedAt)
    },
    {
      key: "status",
      header: t("status"),
      cell: (category: Category) => (
        canManageCategories ? (
          <Switch
            checked={category.status === "active"}
            onCheckedChange={() => handleStatusToggle(category)}
          />
        ) : (
          <Badge variant={category.status === "active" ? "success" : "destructive"}>
            {category.status === "active" ? t("active") : t("inactive")}
          </Badge>
        )
      )
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
            icon: <FileText className="mr-2 h-4 w-4" />,
            label: t("viewColumns"),
            onClick: (category) => console.log("View columns", category.id)
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


import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Category } from "@/types/category";
import { formatDistanceToNow } from "date-fns";
import { az, ru, tr, enUS } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Layers, FileText, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const { t, currentLanguage } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);

  // Helper function to get the appropriate locale for date-fns
  const getLocale = () => {
    switch (currentLanguage) {
      case "az":
        return az;
      case "ru":
        return ru;
      case "tr":
        return tr;
      default:
        return enUS;
    }
  };

  // Format date relative to now
  const formatDate = (dateString: string) => {
    try {
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

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="text-destructive text-4xl mb-4">!</div>
            <h3 className="text-lg font-medium">{t("errorLoadingCategories")}</h3>
            <p className="text-muted-foreground mt-2">{t("tryAgainLater")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Layers className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("noCategoriesFound")}</h3>
            <p className="text-muted-foreground mt-2">{t("noCategoriesFoundDesc")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>{t("categoryName")}</TableHead>
                <TableHead>{t("assignment")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead>{t("lastUpdated")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                {canManageCategories && <TableHead className="text-right">{t("actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.priority}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant={category.assignment === "all" ? "default" : "secondary"}>
                      {category.assignment === "all" ? t("allUsers") : t("sectorsOnly")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(category.createdAt)}</TableCell>
                  <TableCell>{formatDate(category.updatedAt)}</TableCell>
                  <TableCell>
                    {canManageCategories ? (
                      <Switch
                        checked={category.status === "active"}
                        onCheckedChange={() => handleStatusToggle(category)}
                      />
                    ) : (
                      <Badge variant={category.status === "active" ? "success" : "destructive"}>
                        {category.status === "active" ? t("active") : t("inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  {canManageCategories && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log("View columns", category.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("viewColumns")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!categoryToDelete} 
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteCategory")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteCategoryConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (categoryToDelete) {
                  await onDeleteCategory(categoryToDelete);
                  setCategoryToDelete(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryList;

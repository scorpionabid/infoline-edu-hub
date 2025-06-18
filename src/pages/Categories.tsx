import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCategoryOperations } from "@/hooks/categories/useCategoryOperations";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { usePermissions } from '@/hooks/auth/permissions/usePermissions';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateCategoryDialog from "@/components/categories/CreateCategoryDialog";
import { EditCategoryDialog } from "@/components/categories/EditCategoryDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CategoryCard from "@/components/categories/CategoryCard";
import { toast } from "sonner";
import { Category } from "@/types/category";
import CategoryList from "@/components/categories/CategoryList";
import useCategoryActions from "@/hooks/categories/useCategoryActions";

const Categories = () => {
  const { t } = useTranslation();
  const { fetchCategories, addCategory, deleteCategory } = useCategoryOperations();
  const { canAddCategory } = usePermissions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    assignment: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["categories", { searchQuery, ...filters }],
    queryFn: () => fetchCategories(searchQuery || "", filters),
  });

  const handleAddCategory = async (categoryData: any) => {
    try {
      await addCategory(categoryData);
      setIsDialogOpen(false);
      toast.success(t("categories.category_created"), {
        description: t("categories.category_created"),
      });
      refetch();
    } catch (err: any) {
      toast.error(t("errorAddingCategory"), {
        description: err.message,
      });
    }
  };

  const handleEditSuccess = () => {
    toast.success(t("categories.category_updated"), {
      description: t("categories.category_updated"),
    });
    refetch();
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    try {
      if (selectedCategory) {
        await deleteCategory(selectedCategory.id);
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
        toast.success(t("categories.category_deleted"), {
          description: t("categories.category_deleted"),
        });
        refetch();
      }
    } catch (err: any) {
      toast.error(t("errorDeletingCategory"), {
        description: err.message,
      });
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ status: "", assignment: "" });
  };

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to category details page
    window.location.href = `/categories/${categoryId}`;
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    console.log("Categories component rendered");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        {canAddCategory && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('categories.add_category')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("categoriesList")}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search")}
                  className="w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t("filters")}
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("all")}</SelectItem>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  <SelectItem value="draft">{t("draft")}</SelectItem>
                  <SelectItem value="archived">{t("archived")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.assignment}
                onValueChange={(value) => updateFilter("assignment", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("assignment")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("allAssignments")}</SelectItem>
                  <SelectItem value="all">{t("allEntities")}</SelectItem>
                  <SelectItem value="sectors">{t("sectorsOnly")}</SelectItem>
                  <SelectItem value="schools">{t("schoolsOnly")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto"
              >
                <X className="mr-2 h-4 w-4" />
                {t("resetFilters")}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t("loading")}...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>{t("categories.no_categories")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onView={() => handleCategorySelect(category.id)}
                  onEdit={() => handleEditClick(category)}
                  onDelete={() => handleDeleteClick(category)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddCategory}
      />

      {selectedCategory && (
        <EditCategoryDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          category={selectedCategory}
          onSave={handleEditSuccess}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("categories.delete_category")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.delete_category_confirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("categories.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              {t("categories.delete_category")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;


import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Column } from "@/types/column";
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
import { Database, Edit, MoreVertical, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ColumnListProps {
  columns: Column[];
  categories: { id: string; name: string }[];
  isLoading: boolean;
  isError: boolean;
  onDeleteColumn: (id: string) => Promise<boolean>;
  onUpdateStatus: (id: string, status: "active" | "inactive") => Promise<boolean>;
  onEditColumn: (column: Column) => void;
}

const ColumnList: React.FC<ColumnListProps> = ({
  columns,
  categories,
  isLoading,
  isError,
  onDeleteColumn,
  onUpdateStatus,
  onEditColumn,
}) => {
  const { t, language } = useLanguage();
  const canManageColumns = useRole(["superadmin", "regionadmin"]);
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);

  // Helper function to get the appropriate locale for date-fns
  const getLocale = () => {
    switch (language) {
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
            <h3 className="text-lg font-medium">{t("errorLoadingColumns")}</h3>
            <p className="text-muted-foreground mt-2">{t("tryAgainLater")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (columns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("noColumnsFound")}</h3>
            <p className="text-muted-foreground mt-2">{t("noColumnsFoundDesc")}</p>
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
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("required")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                {canManageColumns && <TableHead className="text-right">{t("actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column, index) => (
                <TableRow key={column.id}>
                  <TableCell className="font-medium">{column.order}</TableCell>
                  <TableCell className="font-medium">{column.name}</TableCell>
                  <TableCell>{getCategoryName(column.categoryId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(column.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {column.isRequired ? (
                      <Badge variant="default">
                        {t("required")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {t("optional")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {canManageColumns ? (
                      <Switch
                        checked={column.status === "active"}
                        onCheckedChange={() => handleStatusToggle(column)}
                      />
                    ) : (
                      <Badge variant={column.status === "active" ? "success" : "destructive"}>
                        {column.status === "active" ? t("active") : t("inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  {canManageColumns && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditColumn(column)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setColumnToDelete(column.id)}
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
        open={!!columnToDelete} 
        onOpenChange={(open) => !open && setColumnToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteColumn")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteColumnConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (columnToDelete) {
                  await onDeleteColumn(columnToDelete);
                  setColumnToDelete(null);
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

export default ColumnList;

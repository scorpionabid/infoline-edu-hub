import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRole } from "@/context/auth/useRole";
import { useLanguage } from "@/context/LanguageContext";
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
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Column {
  key: string;
  header: string;
  cell: (item: any, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  isLoading: boolean;
  isError: boolean;
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  actionColumn?: {
    canManage: boolean;
    actions: {
      icon: React.ReactNode;
      label: string;
      onClick: (item: any) => void;
      variant?: "default" | "destructive";
      isHidden?: (item: any) => boolean;
    }[];
  };
  deleteDialog?: {
    title: string;
    description: string;
    itemToDelete: string | null;
    setItemToDelete: (id: string | null) => void;
    onDelete: (id: string) => Promise<boolean>;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  isLoading,
  isError,
  emptyState,
  actionColumn,
  deleteDialog,
}) => {
  const { t } = useLanguage();

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

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="text-destructive text-4xl mb-4">!</div>
            <h3 className="text-lg font-medium">{t("errorLoading")}</h3>
            <p className="text-muted-foreground mt-2">{t("tryAgainLater")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-60 text-center">
            {emptyState.icon}
            <h3 className="text-lg font-medium">{emptyState.title}</h3>
            <p className="text-muted-foreground mt-2">{emptyState.description}</p>
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
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {actionColumn?.canManage && <TableHead className="text-right">{t("actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={`${item.id}-${column.key}`} className={column.className}>
                      {column.cell(item, index)}
                    </TableCell>
                  ))}
                  {actionColumn?.canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actionColumn.actions.map((action, idx) => (
                            !action.isHidden || !action.isHidden(item) ? (
                              <DropdownMenuItem
                                key={idx}
                                className={action.variant === "destructive" ? "text-destructive" : ""}
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ) : null
                          ))}
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

      {deleteDialog && (
        <AlertDialog 
          open={!!deleteDialog.itemToDelete} 
          onOpenChange={(open) => !open && deleteDialog.setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (deleteDialog.itemToDelete) {
                    await deleteDialog.onDelete(deleteDialog.itemToDelete);
                    deleteDialog.setItemToDelete(null);
                  }
                }}
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default DataTable;


import { Category } from "@/types/category";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface CategoryColumnsProps {
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: "active" | "inactive" | "draft") => void;
  isLoading: boolean;
  refetch: () => void;
}

export const CategoryColumns = ({
  onDelete,
  onUpdateStatus,
  // isLoading
}: CategoryColumnsProps): ColumnDef<Category, unknown>[] => [
  {
    accessorKey: "name",
    header: "Ad",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name}
      </div>
    )
  },
  {
    accessorKey: "description",
    header: "Təsvir",
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate">
        {row.original.description || "-"}
      </div>
    )
  },
  {
    accessorKey: "assignment",
    header: "Təyinat",
    cell: ({ row }) => (
      <Badge variant={row.original.assignment === "all" ? "secondary" : "outline"}>
        {row.original.assignment === "all" ? "Hamısı" : "Sektorlar"}
      </Badge>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {getStatusText(row.original.status)}
      </Badge>
    )
  },
  {
    accessorKey: "deadline",
    header: "Son tarix",
    cell: ({ row }) => {
      const deadline = row.original.deadline;
      if (!deadline) return <span className="text-muted-foreground">Təyin olunmayıb</span>;
      
      try {
        const date = new Date(deadline);
        return format(date, "dd.MM.yyyy");
      } catch (error) {
        return <span className="text-muted-foreground">Yanlış format</span>;
      }
    }
  },
  {
    accessorKey: "column_count",
    header: "Sütun sayı",
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.column_count || 0}
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menyu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => window.location.href = `/categories/${category.id}`}
              disabled={isLoading}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>Bax</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = `/categories/${category.id}/edit`}
              disabled={isLoading}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Redaktə et</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              disabled={isLoading}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Sil</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

// Köməkçi funksiyalar
function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active": {
      return "default";
    case "inactive": {
      return "secondary";
    case "draft": {
      return "outline";
    case "archived": {
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "active": {
      return "Aktiv";
    case "inactive": {
      return "Qeyri-aktiv";
    case "draft": {
      return "Qaralama";
    case "archived": {
      return "Arxivlənmiş";
    default:
      return status;
  }
}

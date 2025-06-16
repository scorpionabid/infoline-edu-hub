import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";

interface UserActionsProps {
  user: any;
  onAction?: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onAction }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewUser = () => {
    // View user details
    console.log("View user:", user.id);
    toast.info(t("viewingUser", { name: user.full_name || user.email }));
  };

  const handleEditUser = () => {
    // Edit user details
    console.log("Edit user:", user.id);
    toast.info(t("editingUser", { name: user.full_name || user.email }));
  };

  const handleDeleteUser = async () => {
    if (confirm(t("confirmUserDelete"))) {
      setIsLoading(true);

      try {
        // Delete user logic would go here
        console.log("Delete user:", user.id);

        toast.success(t("userDeleted"));
        if (onAction) onAction();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(t("errorDeletingUser"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t("openMenu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewUser}>
          <Eye className="mr-2 h-4 w-4" />
          <span>{t("view")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditUser}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{t("edit")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteUser}
          disabled={isLoading}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{t("delete")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;

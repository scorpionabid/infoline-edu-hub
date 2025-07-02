import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye, Lock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { FullUserData } from "@/types/user";
import { UserRole } from "@/types/supabase";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserListTableProps {
  users: FullUserData[];
  onEdit: (user: FullUserData) => void;
  onDelete: (user: FullUserData) => void;
  onViewDetails: (user: FullUserData) => void;
  currentUserRole: UserRole;
  renderRow?: (user: FullUserData) => React.ReactNode;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

const UserListTable: React.FC<UserListTableProps> = ({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  currentUserRole,
  renderRow,
  onSort,
  sortField,
  sortDirection,
}) => {
  const { t } = useTranslation();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default";
      case "regionadmin":
        return "secondary";
      case "sectoradmin":
        return "warning";
      case "schooladmin":
        return "success";
      default:
        return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "superadmin":
        return t("superadmin");
      case "regionadmin":
        return t("regionAdmin");
      case "sectoradmin":
        return t("sectorAdmin");
      case "schooladmin":
        return t("schoolAdmin");
      default:
        return t("user");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const SortableHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort?.(field)}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {getSortIcon(field)}
        </div>
      </Button>
    </TableHead>
  );

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="full_name">{t("fullName")}</SortableHeader>
              <SortableHeader field="email">{t("email")}</SortableHeader>
              <SortableHeader field="role">{t("role")}</SortableHeader>
              <SortableHeader field="last_login">{t("lastLogin")}</SortableHeader>
              <SortableHeader field="status">{t("status")}</SortableHeader>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) =>
                renderRow ? (
                  <React.Fragment key={user.id}>
                    {renderRow(user)}
                  </React.Fragment>
                ) : (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : t("never")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "success" : "destructive"
                        }
                      >
                        {user.status === "active" ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onViewDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("viewDetails")}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("edit")}</p>
                          </TooltipContent>
                        </Tooltip>

                        {(currentUserRole === "superadmin" || currentUserRole === "regionadmin") && (
                          <>
                            {currentUserRole === "superadmin" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      /* Implement reset password */
                                    }}
                                  >
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("resetPassword")}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(user);
                                  }}
                                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("delete")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default UserListTable;

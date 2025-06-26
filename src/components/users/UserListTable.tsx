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
import { Trash2, Edit, Eye, Lock } from "lucide-react";
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
}

const UserListTable: React.FC<UserListTableProps> = ({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  currentUserRole,
  renderRow,
}) => {
  const { t } = useTranslation();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin": {
        return "default";
      case "regionadmin": {
        return "secondary";
      case "sectoradmin": {
        return "warning";
      case "schooladmin": {
        return "success";
      default:
        return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "superadmin": {
        return t("superadmin");
      case "regionadmin": {
        return t("regionAdmin");
      case "sectoradmin": {
        return t("sectorAdmin");
      case "schooladmin": {
        return t("schoolAdmin");
      default:
        return t("user");
    }
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fullName")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("lastLogin")}</TableHead>
              <TableHead>{t("status")}</TableHead>
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

                        {currentUserRole === "superadmin" && (
                          <>
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

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDelete(user)}
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

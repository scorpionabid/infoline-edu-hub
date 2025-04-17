import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData, UserRole } from '@/types/supabase'; // Düzəliş: düzgün tip istifadəsi
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, MoreHorizontal, Eye, UserPlus, UserX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { DeleteUserDialog } from './DeleteUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserFilters } from './UserFilters';
import { Badge } from '@/components/ui/badge';
import { UserStatus } from '@/types/supabase';

interface User {
  id: string;
  full_name?: string | null;
  status: UserStatus;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
  last_login: null;
  createdAt: string;
  updatedAt: string;
  regionId: null;
  sectorId: null;
  schoolId: null;
  notificationSettings?: {
    email: boolean;
    system: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

const mockUsers: FullUserData[] = [
  {
    id: "1",
    full_name: "Admin User",
    status: "active",
    role: "superadmin", // Düzəliş: string yerinə UserRole tipi
    email: "admin@example.com",
    language: "az", // Əlavə: tələb olunan 'language' sahəsi
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
    last_login: null,
    createdAt: "2023-01-01T10:00:00Z",
    updatedAt: "2023-01-01T10:00:00Z",
    regionId: null,
    sectorId: null,
    schoolId: null,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "2",
    full_name: "Region Admin",
    status: "active",
    role: "regionadmin", // Düzəliş: string yerinə UserRole tipi
    email: "region@example.com",
    language: "az", // Əlavə: tələb olunan 'language' sahəsi
    created_at: "2023-02-15T14:30:00Z",
    updated_at: "2023-02-15T14:30:00Z",
    last_login: null,
    createdAt: "2023-02-15T14:30:00Z",
    updatedAt: "2023-02-15T14:30:00Z",
    regionId: null,
    sectorId: null,
    schoolId: null,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "3",
    full_name: "Sector Admin",
    status: "inactive",
    role: "sectoradmin", // Düzəliş: string yerinə UserRole tipi
    email: "sector@example.com",
    language: "az", // Əlavə: tələb olunan 'language' sahəsi
    created_at: "2023-03-22T09:15:00Z",
    updated_at: "2023-03-22T09:15:00Z",
    last_login: null,
    createdAt: "2023-03-22T09:15:00Z",
    updatedAt: "2023-03-22T09:15:00Z",
    regionId: null,
    sectorId: null,
    schoolId: null,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "4",
    full_name: "School Admin",
    status: "active",
    role: "schooladmin", // Düzəliş: string yerinə UserRole tipi
    email: "school@example.com",
    language: "az", // Əlavə: tələb olunan 'language' sahəsi
    created_at: "2023-04-05T16:45:00Z",
    updated_at: "2023-04-05T16:45:00Z",
    last_login: null,
    createdAt: "2023-04-05T16:45:00Z",
    updatedAt: "2023-04-05T16:45:00Z",
    regionId: null,
    sectorId: null,
    schoolId: null,
    notificationSettings: {
      email: true,
      system: true
    }
  },
  {
    id: "5",
    full_name: "Regular User",
    status: "active",
    role: "user", // Düzəliş: string yerinə UserRole tipi
    email: "user@example.com",
    language: "az", // Əlavə: tələb olunan 'language' sahəsi
    created_at: "2023-05-12T11:20:00Z",
    updated_at: "2023-05-12T11:20:00Z",
    last_login: null,
    createdAt: "2023-05-12T11:20:00Z",
    updatedAt: "2023-05-12T11:20:00Z",
    regionId: null,
    sectorId: null,
    schoolId: null,
    notificationSettings: {
      email: true,
      system: true
    }
  },
];

const UserList: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const columns: ColumnDef<FullUserData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(event) => {
            table.toggleAllPageRowsSelected(event.target.checked)
          }}
          className="translate-y-[2px] h-4 w-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="translate-y-[2px] h-4 w-4"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "full_name",
      header: t("fullName"),
    },
    {
      accessorKey: "email",
      header: t("email"),
    },
    {
      accessorKey: "role",
      header: t("role"),
      filterFn: (row, id, value) => {
        return value === 'all' || row.getValue<string>(id) === value;
      },
      cell: ({ row }) => {
        const role = row.getValue<string>("role");
        let badgeText = t(role);
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";

        switch (role) {
          case "superadmin":
            badgeVariant = "default";
            break;
          case "regionadmin":
            badgeVariant = "secondary";
            break;
          case "sectoradmin":
            badgeVariant = "outline";
            break;
          case "schooladmin":
            badgeVariant = "outline";
            break;
          case "user":
            badgeVariant = "outline";
            break;
          default:
            badgeText = "Unknown";
            break;
        }

        return <Badge variant={badgeVariant}>{badgeText}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: t("status"),
      filterFn: (row, id, value) => {
        return value === 'all' || row.getValue<string>(id) === value;
      },
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        let badgeText = t(status);
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";

        switch (status) {
          case "active":
            badgeVariant = "default";
            break;
          case "inactive":
            badgeVariant = "secondary";
            break;
          case "blocked":
            badgeVariant = "destructive";
            break;
          default:
            badgeText = "Unknown";
            break;
        }

        return <Badge variant={badgeVariant}>{badgeText}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: t("createdAt"),
    },
    {
      accessorKey: "updated_at",
      header: t("updatedAt"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const user = row.original;

        const handleEdit = () => {
          setSelectedUser(user);
          setIsEditOpen(true);
        };

        const handleDelete = () => {
          setSelectedUser(user);
          setIsDeleteOpen(true);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
      sorting,
    },
  });

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleDeleteUser = async (user: User) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        setIsDeleteOpen(false);
        setSelectedUser(null);
        toast.success(t('userDeleted'), {
          description: t('userDeletedDesc')
        });
        resolve();
      }, 1000);
    });
  };

  const handleSaveUser = async (updatedUser: FullUserData) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUsers(prevUsers =>
          prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
        );
        setIsEditOpen(false);
        setSelectedUser(null);
        resolve();
      }, 1000);
    });
  };

  const filteredUsers = React.useMemo(() => {
    let filtered = mockUsers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [statusFilter, roleFilter, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("users")}</h1>
          <p className="text-muted-foreground">{t("usersDescription")}</p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("createUser")}
        </Button>
      </div>

      <UserFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHeader key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (
                          <div className="flex items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                className="ml-2"
                              >
                                {header.column.getIsSorted() === false ? (
                                  <span className="sr-only">Sort</span>
                                ) : header.column.getIsSorted() === "asc" ? (
                                  "▲"
                                ) : (
                                  "▼"
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                    </TableHeader>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  {t("noUsersFound")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
        onDelete={handleDeleteUser}
      />

      <EditUserDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserList;

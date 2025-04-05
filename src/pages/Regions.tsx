import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/hooks/useRegions';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { Region } from '@/types/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCreateRegionAdmin } from '@/hooks/useCreateRegionAdmin';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
];

const regionSchema = z.object({
  name: z.string().min(2, {
    message: "Region adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  status: z.string().optional(),
  adminName: z.string().min(2, {
    message: "Admin adı ən azı 2 simvol olmalıdır.",
  }),
  adminEmail: z.string().email({
    message: "Düzgün email formatı daxil edin.",
  }),
  adminPassword: z.string().min(6, {
    message: "Şifrə ən azı 6 simvol olmalıdır.",
  }),
})

type RegionSchemaType = z.infer<typeof regionSchema>

const Regions = () => {
  const { t } = useLanguage();
  const { regions, loading, error, fetchRegions, addRegion, updateRegion: updateRegionHook, deleteRegion } = useRegions();
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { toast } = useToast();
  const { createRegionWithAdmin, loading: createRegionLoading } = useCreateRegionAdmin();

  const regionForm = useForm<RegionSchemaType>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  })

  const columns: ColumnDef<Region>[] = [
    {
      accessorKey: "name",
      header: t("regionName"),
    },
    {
      accessorKey: "description",
      header: t("description"),
    },
    {
      accessorKey: "status",
      header: t("status"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRegion(row.original);
              setOpen(true);
              regionForm.reset({
                name: row.original.name,
                description: row.original.description,
                status: row.original.status || 'active',
                adminName: '',
                adminEmail: '',
                adminPassword: '',
              });
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("edit")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const confirmDelete = window.confirm(t('confirmDeleteRegion'));
              if (confirmDelete) {
                handleDeleteRegion(row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("delete")}
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: regions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const onSubmit = async (values: RegionSchemaType) => {
    if (selectedRegion) {
      handleUpdateRegion(selectedRegion.id, {
        name: values.name,
        description: values.description,
        status: values.status,
      });
    } else {
      try {
        await createRegionWithAdmin({
          regionName: values.name,
          regionDescription: values.description,
          regionStatus: values.status,
          adminName: values.adminName,
          adminEmail: values.adminEmail,
          adminPassword: values.adminPassword,
        });
        toast({
          title: t('regionCreated'),
          description: t('regionCreatedDesc'),
        });
        closeDialog();
        fetchRegions();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: t('errorCreatingRegion'),
          description: error.message,
        });
      }
    }
  }

  const closeDialog = () => {
    setOpen(false);
    setSelectedRegion(null);
    regionForm.reset();
  };

  const handleUpdateRegion = (id: string, data: Partial<Region>) => {
    updateRegionHook(id, data);
    closeDialog();
    fetchRegions();
  };
  
  const handleDeleteRegion = (id: string) => {
    deleteRegion(id);
    closeDialog();
    fetchRegions();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t("regions")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusIcon className="h-4 w-4 mr-2" />
              {t("addRegion")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedRegion ? t('editRegion') : t('addRegion')}</DialogTitle>
              <DialogDescription>
                {t("createEditRegions")}
              </DialogDescription>
            </DialogHeader>
            <Form {...regionForm}>
              <form onSubmit={regionForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={regionForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("regionName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("regionName")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={regionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("description")}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={regionForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("status")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectStatus")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(status.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!selectedRegion && (
                  <>
                    <FormField
                      control={regionForm.control}
                      name="adminName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminName")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("adminName")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminEmail")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("adminEmail")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={regionForm.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminPassword")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t("adminPassword")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <div className="flex justify-end">
                  <Button type="submit" disabled={createRegionLoading}>
                    {selectedRegion ? t("updateRegion") : t("createRegion")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <p className="text-red-500">{t("error")}: {error.message}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  {t("totalRegions")}: {regions.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Regions;

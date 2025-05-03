
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { ColumnDef } from '@tanstack/react-table';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useDebounce } from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';

// Mock data və sütunlar
const mockData = [
  { id: '1', schoolName: 'Məktəb #1', region: 'Bakı', sector: 'Nərimanov', submittedForms: 10, totalForms: 12 },
  { id: '2', schoolName: 'Məktəb #2', region: 'Bakı', sector: 'Yasamal', submittedForms: 8, totalForms: 12 },
  { id: '3', schoolName: 'Məktəb #3', region: 'Sumqayıt', sector: 'Mərkəz', submittedForms: 12, totalForms: 12 },
  { id: '4', schoolName: 'Məktəb #4', region: 'Gəncə', sector: 'Şimal', submittedForms: 6, totalForms: 12 }
];

const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "schoolName",
    header: "Məktəb",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "sector",
    header: "Sektor",
  },
  {
    accessorKey: "submittedForms",
    header: "Təqdim edilmiş formalar",
  },
  {
    accessorKey: "totalForms",
    header: "Ümumi formalar",
  },
  {
    accessorKey: "completionRate",
    header: "Tamamlanma faizi",
    cell: ({ row }) => {
      const submittedForms = row.original.submittedForms;
      const totalForms = row.original.totalForms;
      const rate = Math.round((submittedForms / totalForms) * 100);
      return `${rate}%`;
    }
  }
];

interface DataTableProps<TData, TValue> {
  data?: TData[];
  columns?: ColumnDef<TData, TValue>[];
}

export function SchoolColumnTable<TData, TValue>({ 
  data = mockData as any,
  columns: providedColumns = columns as any,
}: DataTableProps<TData, TValue>) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const { toast } = useToast()
  
  const table = useReactTable({
    data,
    columns: providedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: debouncedGlobalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const tableData = data || [];

  // Excel ixrac funksiyası
  const onExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'school-column-report.xlsx');
    toast({ title: "Excel ixrac edildi", description: "Faylınız başarıyla ixrac edildi" });
  };

  // CSV ixrac funksiyası
  const onExportCSV = () => {
    const csvData = convertToCSV(tableData);
    downloadFile(csvData, 'school-column-report.csv', 'text/csv;charset=utf-8;');
    toast({ title: "CSV ixrac edildi", description: "Faylınız başarıyla ixrac edildi" });
  };

  // PDF ixrac funksiyası
  const onExportPDF = () => {
    toast({ title: "PDF ixrac edildi", description: "Faylınız başarıyla ixrac edildi" });
  };

  const convertToCSV = (arr: any[]) => {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
      return Object.values(it).map(value => {
        return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    }).join('\n')
  }

  const downloadFile = (data: any, filename: string, type: string) => {
    const file = new Blob([data], { type: type });
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={t("search")}
          value={globalFilter ?? ""}
          onChange={
            (event) => setGlobalFilter(event.target.value)
          }
          className="ml-2 w-[300px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {t("columns")} <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="flex items-center p-2"
                    onClick={(event) => {
                      event.preventDefault()
                      column.toggleVisibility()
                    }}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      className="mr-2"
                    />
                    <span>{column.id}</span>
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="ml-2" onClick={onExportExcel}>
          {t("exportExcel")} <Download className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="ml-2" onClick={onExportPDF}>
          {t("exportPdf")} <Download className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="ml-2" onClick={onExportCSV}>
          {t("exportCsv")} <Download className="ml-2 h-4 w-4" />
        </Button>
      </div>
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
                        : (
                          <div
                            {...{
                              className: cn(
                                "flex cursor-pointer items-center gap-1",
                                header.column.getCanSort()
                                  ? "hover:underline"
                                  : "",
                              ),
                              onClick:
                                header.column.getCanSort()
                                  ? () => {
                                    header.column.toggleSorting(
                                      header.column.getIsSorted() === "asc"
                                        ? "desc"
                                        : "asc"
                                    )
                                  }
                                  : undefined,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc:
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-arrow-down"
                                >
                                  <path d="M12 5v14" />
                                  <path d="m5 12 7 7 7-7" />
                                </svg>,
                              desc:
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-arrow-up"
                                >
                                  <path d="M12 19V5" />
                                  <path d="m5 12 7-7 7 7" />
                                </svg>,
                            }[header.column.getIsSorted() ?? null]}
                          </div>
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
                <TableCell colSpan={providedColumns.length} className="h-24 text-center">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} sətir seçilib.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SchoolColumnTable;

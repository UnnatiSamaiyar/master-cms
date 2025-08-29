"use client";
import React, { Fragment } from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUIStore from "@/store/uiStore";
import { Plus } from "lucide-react";
import SearchInput from "../search-input";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const AlertDelete = dynamic(() => import("../aler-delete-dialog"));

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const DataTable = <TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnSelectedIds, setcolumnSelectedIds] = React.useState<string[]>(
    [],
  );
  const { data: session } = useSession();

  const { adminAddSheetOpen, adminAddSheetChange } = useUIStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  const selectedIds = React.useMemo(() => {
    const indeces = Object.keys(rowSelection).map((index) =>
      parseInt(index, 10),
    );
    return indeces
      .map((index) => data[index])
      .filter((item) => item !== undefined)
      .map((item) => (item as any).id);
  }, [rowSelection, data]);

  React.useEffect(() => {
    setcolumnSelectedIds(selectedIds);
  }, [selectedIds, data]);

  return (
    <Fragment>
      <div className="flex items-center justify-between my-3">
        <SearchInput
          placeholder={"Search by name or email"}
          className="max-w-md"
        />
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <AlertDelete arr={selectedIds} type="admins" />
          )}
          <Button
            disabled={session?.user.role === "subadmin" ? true : false}
            onClick={() => adminAddSheetChange(!adminAddSheetOpen)}
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.columnDef.header as any}
                  </DropdownMenuCheckboxItem>
                ))}{" "}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
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
                          header.getContext(),
                        )}
                  </TableHead>
                );
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
                No Data has been found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Fragment>
  );
};

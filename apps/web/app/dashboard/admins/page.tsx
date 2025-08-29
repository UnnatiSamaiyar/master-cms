import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { adminColumns } from "@/components/admin/admin-column";
import { auth } from "@/auth";
import { Metadata } from "next";
import { apiClient } from "@/lib/apiClient";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { DataTable } from "@/components/admin/admin-data-table";
import PerRowSelect from "@/components/per-row-select";
import PaginationComponent from "@/components/pagination-controller";

export const metadata: Metadata = {
  title: "Admins",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  if (!session) throw new Error("You are unauthorized.");
  if (session.user.role !== "admin") {
    throw new Error("You don't right to access the admins.");
  }
  const token = session.user.accessToken as string;
  let page = Number((await searchParams).page || 1);
  let perRow = Number((await searchParams).perRow || 10);

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const url = `/api/admins?page=${page}&perRow=${perRow}${search}`;

  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["admins"],
    },
  });
  if (error) {
    return (
      <div className="flex justify-center text-center mx-auto my-5">
        <p>{error}</p>
      </div>
    );
  }
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-4xl font-semibold">Manage Admins</h1>
      <Card>
        <CardContent>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable data={data.admins} columns={adminColumns} />
          </ErrorBoundary>
          {data.totalCount > 1 && (
            <div className="my-5 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
              <div className="flex space-x-2 items-center">
                <p className="font-bold text-sm">Rows per page</p>
                <PerRowSelect />
              </div>
              {data.totalCount > perRow && (
                <div>
                  <PaginationComponent totalResults={data.totalCount} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

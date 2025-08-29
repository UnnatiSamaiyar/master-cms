import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { DataTable } from "@/components/ads/ad-data-table";
import PerRowSelect from "@/components/per-row-select";
import PaginationComponent from "@/components/pagination-controller";
import { Metadata } from "next";
import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { adsColumns } from "@/components/ads/ad-column";

export const metadata: Metadata = {
  title: "Ads",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  if (!session) throw new Error("You are unauthorized.");
  const token = session.user.accessToken as string;
  let page = Number((await searchParams).page || 1);
  let perRow = Number((await searchParams).perRow || 10);

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const url = `/api/ads?page=${page}&perRow=${perRow}${search}`;
  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["ads"],
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-4xl font-semibold">Manage Ads</h1>
      <Card>
        <CardContent>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable columns={adsColumns} data={data.ads} />
          </ErrorBoundary>
          {data.totalCount > perRow && (
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

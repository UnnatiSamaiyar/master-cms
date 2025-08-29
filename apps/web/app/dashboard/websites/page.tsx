import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { websiteColumns } from "@/components/websites/column";
import { WebsiteDataTable } from "@/components/websites/data-table";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import React from "react";
import PerRowSelect from "@/components/per-row-select";
import PaginationComponent from "@/components/pagination-controller";

export const metadata: Metadata = {
  title: "Websites",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  const token = session?.user.accessToken;

  const perRow = Number((await searchParams).perRow || 10);
  const page = Number((await searchParams).page || 1);
  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const url = `/api/websites?perRow=${perRow}&page=${page}${search}`;
  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["websites"],
    },
  });
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Websites</h1>
          <p className="text-gray-600 mt-1">
            Manage all your websites from one place
          </p>
        </div>
      </div>
      <Card>
        <CardContent>
          <WebsiteDataTable columns={websiteColumns} data={data.websites} />
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
    </div>
  );
}

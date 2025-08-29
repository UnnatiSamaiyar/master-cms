import { auth } from "@/auth";
import Categories from "@/components/category";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Categories",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  const token = session?.user.accessToken as string;

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const url = `/api/websites?perRow=5${search}`;
  const { error, data } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Categories websites={data.websites} />
    </div>
  );
}

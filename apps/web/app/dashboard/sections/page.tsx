import Sections from "@/components/sections";
import React from "react";
import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sections",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  const token = session?.user.accessToken;

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
      <Sections websites={data.websites} />
    </div>
  );
}

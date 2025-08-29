import React from "react";
import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import AddSectionArticle from "@/components/sections/add-article";
import SearchInput from "@/components/search-input";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}

export const metadata: Metadata = {
  title: "Push Article to section",
};

export default async function page(props: Props) {
  const { id } = await props.params;
  const session = await auth();
  const token = session?.user.accessToken as string;
  const { websiteId } = await props.searchParams;
  if (!websiteId) throw new Error("Invalid link");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const website = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (website.error) throw new Error(website.error);

  let page = Number((await props.searchParams).page || 1);
  let perRow = Number((await props.searchParams).perRow || 10);

  const query = (await props.searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }
  const url = `/api/articles/section/${id}?page=${page}&perRow=${perRow}${search}`;
  const { data, error } = await apiClient.get(url, {
    baseUrl: website.data.backendUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) <div>{error}</div>;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Push Articles</h1>
        <SearchInput placeholder="Search articles" className="max-w-md" />
      </div>
      {data.length < 1 ? (
        <div className="text-center my-5">No articles found</div>
      ) : (
        <AddSectionArticle articles={data} />
      )}
    </div>
  );
}

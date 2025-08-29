import React from "react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import Link from "next/link";
import SectionArticleItem from "@/components/sections/article-item";

export const metadata: Metadata = {
  title: "Manage Section Articles",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}

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

  const url = `/api/sections/${id}/articles?page=${page}&perRow=${perRow}${search}`;
  const [sectionArticles, section] = await Promise.all([
    apiClient.get(url, {
      baseUrl: website.data.backendUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    apiClient.get(`/api/sections/${id}`, {
      baseUrl: website.data.backendUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);
  if (sectionArticles.error) <div>{sectionArticles.error}</div>;
  if (section.error) <div>{section.error}</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
              {website.data.name}
            </span>
          </div>
          <p className="text-gray-600">
            Manage your articles for "{section.data.name}" section
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/sections/${id}/add?websiteId=${websiteId}`}>
            Add Articles
          </Link>
        </Button>
      </div>
      {sectionArticles.data.length < 1 ? (
        <div className="my-5 text-center">
          No articles attached to this section
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectionArticles.data.map((article: any) => (
            <SectionArticleItem
              article={article}
              section={section.data}
              key={article.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import React from "react";
import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { Article } from "@/types/article";
import ArticleItem from "@/components/article/article-item";
import SearchInput from "@/components/search-input";
import { FileCheck, FileText, Search } from "lucide-react";
import PerRowSelect from "@/components/per-row-select";
import PaginationComponent from "@/components/pagination-controller";
import AddArticleButton from "@/components/article/add-button";

export const metadata: Metadata = {
  title: "Articles",
};

interface Props {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ searchParams }: Props) {
  const sesssion = await auth();
  const token = sesssion?.user.accessToken as string;

  const page = Number((await searchParams).page || 1);
  const perRow = Number((await searchParams).perRow || 10);

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const url = `/api/articles?page=${page}&perRow=${perRow}${search}`;

  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error) {
    return (
      <div className="flex justify-center text-center mx-auto my-5">
        <p>{error}</p>
      </div>
    );
  }
  const draftsData = data.articles.filter((item: Article) => !item.isPublished);
  const publishedData = data.articles.filter(
    (item: Article) => item.isPublished,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center my-2">
        <h1 className="text-3xl font-bold">Articles</h1>
        <AddArticleButton />
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <div className="md:flex md:items-center md:justify-between space-y-2">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="published" className="flex items-center">
              <FileCheck className="mr-2 h-4 w-4" />
              Published
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Drafts
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <SearchInput placeholder="Search articles..." className="pl-10" />
          </div>
        </div>
        <TabsContent value="all">
          <ArticleGrid articles={data.articles} />
        </TabsContent>
        <TabsContent value="published">
          <ArticleGrid articles={publishedData} />
        </TabsContent>
        <TabsContent value="drafts">
          <ArticleGrid articles={draftsData} />
        </TabsContent>
      </Tabs>
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
    </div>
  );
}

function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleItem key={article.id} data={article} />
      ))}
      {articles.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground text-lg">No articles found</p>
        </div>
      )}
    </div>
  );
}

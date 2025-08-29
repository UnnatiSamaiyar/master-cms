import { auth } from "@/auth";
import ArticlePushPage from "@/components/article/push";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Push Article",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function page(props: Props) {
  const { id } = await props.params;
  const session = await auth();
  const token = session?.user.accessToken as string;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [articles, websites] = await Promise.all([
    apiClient.get(`/api/articles/${id}`, {
      headers,
    }),
    apiClient.get(`/api/website-article/${id}`, { headers }),
  ]);

  if (articles.error) {
    return <div>{articles.error}</div>;
  }
  if (websites.error) {
    return <div>{websites.error}</div>;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ArticlePushPage article={articles.data} websites={websites.data} />
    </main>
  );
}

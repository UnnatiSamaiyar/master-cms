import { auth } from "@/auth";
import AdsPushToArticleComp from "@/components/ads/push-to-article";
import { apiClient } from "@/lib/apiClient";
import React from "react";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    [key: string]: string;
  }>;
}

export default async function page({ searchParams, params }: Props) {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const adsId = (await params).id;
  const { websiteId } = await searchParams;

  let page = Number((await searchParams).page || 1);
  let perRow = Number((await searchParams).perRow || 10);

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { error, data } = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (error) {
    return <div>{error}</div>;
  }

  const articleUrl = `/api/articles/ads/${adsId}?page=${page}&perRow=${perRow}${search}`;

  const [ad, articles] = await Promise.all([
    apiClient.get(`/api/ads/${adsId}`, {
      baseUrl: data.backendUrl,
    }),
    apiClient.get(articleUrl, {
      baseUrl: data.backendUrl,
    }),
  ]);
  if (ad.error) {
    return <div>{ad.error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AdsPushToArticleComp articles={articles.data.articles} ad={ad.data} />
    </div>
  );
}

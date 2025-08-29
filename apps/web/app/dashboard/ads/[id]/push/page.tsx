import { auth } from "@/auth";
import AdsPushComp from "@/components/ads/push-ad";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}

export const metadata: Metadata = {
  title: "Push Ads",
};

export default async function page({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) throw new Error("You are unauthorized.");
  const token = session.user.accessToken;
  let page = Number((await searchParams).page || 1);
  let perRow = Number((await searchParams).perRow || 12);

  const query = (await searchParams).query;
  let search = "";
  if (query && query.length) {
    search = `&search=${query}`;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const id = (await params).id;
  const [ads, websites] = await Promise.all([
    apiClient.get(`/api/ads/${id}`, {
      headers,
    }),
    apiClient.get(
      `/api/website-ads/${id}?perRow=${perRow}&page=${page}${search}`,
      { headers },
    ),
  ]);

  if (ads.error) {
    return <div>{ads.error}</div>;
  }
  if (websites.error) {
    return <div>{websites.error}</div>;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <AdsPushComp ad={ads.data} websites={websites.data} />
    </main>
  );
}

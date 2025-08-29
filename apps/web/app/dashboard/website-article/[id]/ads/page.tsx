import { auth } from "@/auth";
import ErrorFallback from "@/components/ErrorFallback";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { ErrorBoundary } from "react-error-boundary";
import React from "react";
import { WebsiteArticleAdsColumns } from "@/components/website-article/ad-columns";
import { DataTable } from "@/components/website-article/website-article-ad";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    [key: string]: string;
  }>;
}

export default async function page(props: Props) {
  const { id } = await props.params;
  const session = await auth();
  const token = session?.user.accessToken as string;
  console.log("articles ads", id);
  const { websiteId } = await props.searchParams;
  if (!websiteId) throw new Error("Invalid link");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const website = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (website.error) throw new Error(website.error);

  const url = `/api/articles/ads/by/${id}`;
  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseUrl: website.data.backendUrl,
  });

  if (error) {
    return (
      <div className="flex justify-center text-center mx-auto my-5">
        <p>{error}</p>
      </div>
    );
  }
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Article Ads</h3>
      </div>
      <Card>
        <CardContent>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable columns={WebsiteArticleAdsColumns} data={data} />
          </ErrorBoundary>
        </CardContent>
      </Card>{" "}
    </main>
  );
}

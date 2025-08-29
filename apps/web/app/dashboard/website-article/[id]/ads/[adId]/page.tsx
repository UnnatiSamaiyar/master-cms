import { auth } from "@/auth";
import { UpdateWebsiteArticleAdsForm } from "@/components/forms/website-article/ads/edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { ImagePlus } from "lucide-react";
import React from "react";

interface Props {
  params: Promise<{
    id: string;
    adId: string;
  }>;
  searchParams: Promise<{
    [key: string]: string;
  }>;
}

export default async function page({ params, searchParams }: Props) {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const adsId = (await params).adId;
  const { websiteId } = await searchParams;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { error, data } = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (error) {
    return <div>{error}</div>;
  }
  const ads = await apiClient.get(`/api/articles/ads/articleAdId/${adsId}`, {
    baseUrl: data.backendUrl,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <ImagePlus className="h-6 w-6 text-primary" />
            Edit an Ad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateWebsiteArticleAdsForm ad={ads.data} />
        </CardContent>
      </Card>
    </div>
  );
}

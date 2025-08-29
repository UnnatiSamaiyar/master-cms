import { auth } from "@/auth";
import { WebsiteAddAdsForm } from "@/components/forms/website-ads/add";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { ImagePlus } from "lucide-react";
import React from "react";

interface Props {
  searchParams: Promise<{
    [key: string]: string;
  }>;
}

export default async function page({ searchParams }: Props) {
  const session = await auth();
  const token = session?.user.accessToken as string;
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <ImagePlus className="h-6 w-6 text-primary" />
            Add an Ad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WebsiteAddAdsForm />
        </CardContent>
      </Card>
    </div>
  );
}

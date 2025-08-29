import { CreateWebsiteArticleAdsForm } from "@/components/forms/website-article/ads/add";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus } from "lucide-react";
import React from "react";

export default function page() {
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
          <CreateWebsiteArticleAdsForm />
        </CardContent>
      </Card>
    </div>
  );
}

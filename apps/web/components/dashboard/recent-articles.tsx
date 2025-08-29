import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { FileText } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Article } from "@/types/article";
import { CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";

export default async function RecentArticles() {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const { data, error } = await apiClient.get(`/api/articles/stats/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return <div className="text-center">{error}</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Articles
            </h3>
          </div>
          <Button disabled={session?.user.role === "subadmin"} variant="link">
            <Link href="/dashboard/articles">Manage Articles</Link>
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {data.map((article: Article) => (
          <div
            key={article.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                  {article.title}
                </h4>
                <CardDescription>
                  {article.description.slice(0, 60)}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {article.isPublished ? "Published" : "Drafts"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

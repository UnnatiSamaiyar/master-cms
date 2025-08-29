import { apiClient } from "@/lib/apiClient";
import { toastOptions } from "@/lib/constant";
import useSectionStore from "@/store/sectionStore";
import { Article } from "@/types/article";
import { GripHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { Fragment, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  sectionId: string;
}

export default function SectionArticle({ sectionId }: Props) {
  const [articles, setarticles] = useState<Article[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const { selectedWebsite } = useSectionStore();
  if (!selectedWebsite) return;

  useEffect(() => {
    startTransition(async () => {
      const url = `/api/websites/${selectedWebsite.id}/sections/${sectionId}/articles`;
      const { data, error } = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (error) {
        setError(error);
        toast.error(error, toastOptions);
      } else {
        setarticles(data);
      }
    });
  }, [sectionId]);
  return (
    <Fragment>
      {isPending && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}
      {articles.length > 0 ? (
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center p-2 bg-gray-50 rounded-lg"
            >
              <GripHorizontal className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">{article.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-600">
          No articles found for this sections.
        </div>
      )}{" "}
    </Fragment>
  );
}

import { auth } from "@/auth";
import UnpublishArticle from "@/components/article/unpublish-article";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Write Content",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}

const Editor = dynamic(() => import("@/components/Editor"));

export default async function page(props: Props) {
  const { id } = await props.params;
  const session = await auth();
  const token = session?.user.accessToken as string;
  const { websiteId } = await props.searchParams;
  if (!websiteId) throw new Error("Invalid link");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const website = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (website.error) throw new Error(website.error);

  const url = `/api/articles/content/${id}`;
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
        <h3 className="text-xl font-bold">{data.title}</h3>
        {data.isPublished ? (
          <UnpublishArticle article={data} />
        ) : (
          <Button asChild>
            <Link
              href={`/dashboard/website-article/${data.articleId}/publish?websiteId=${websiteId}`}
            >
              Publish
            </Link>
          </Button>
        )}
      </div>{" "}
      <Editor article={data} />
    </main>
  );
}

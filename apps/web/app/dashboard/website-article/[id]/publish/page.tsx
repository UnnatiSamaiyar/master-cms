import { auth } from "@/auth";
import { PublishArticleForm } from "@/components/forms/article/publish-article";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publish article",
};

interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ params, searchParams }: Props) {
  const session = await auth();
  const id = (await params).id;
  const token = session?.user.accessToken as string;

  const { websiteId } = await searchParams;
  if (!websiteId) throw new Error("Invalid link");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const website = await apiClient.get(`/api/websites/${websiteId}`, {
    headers,
  });
  if (website.error) throw new Error(website.error);

  const url = `/api/articles/${id}`;
  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseUrl: website.data.backendUrl,
  });
  if (error) {
    <div className="flex justify-center text-center mx-auto my-5">
      <p>{error}</p>
    </div>;
  }

  if (data.isPublished) {
    return (
      <div className="flex justify-center text-center mx-auto my-5">
        <p>{data.title} is already published. </p>
      </div>
    );
  }
  return (
    <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
      <h3 className="text-xl font-bold">Publish Article</h3>
      <PublishArticleForm article={data} />
    </main>
  );
}

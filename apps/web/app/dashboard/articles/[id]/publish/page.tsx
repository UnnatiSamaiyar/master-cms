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
}

export default async function page({ params }: Props) {
  const session = await auth();
  const id = (await params).id;
  const token = session?.user.accessToken as string;
  const url = `/api/articles/${id}`;
  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h3 className="text-xl font-bold">Publish Article</h3>
      <PublishArticleForm article={data} />
    </main>
  );
}

"use client";
import { useTransition, useState, Suspense } from "react";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { Article } from "@/types/article";
import ArticleItem from "@/components/article/article-item";

interface Props {
  articles: Article[];
}

export default function WebsiteDetialsTab({ articles }: Props) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: string) => {
    startTransition(() => setSelectedTab(tab));
  };

  return (
    <Tabs
      defaultValue="articles"
      value={selectedTab}
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="articles">Articles</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="links">Links</TabsTrigger>
      </TabsList>
      <TabsContent value="permissions">
        <Suspense fallback={<p>Loading permissions...</p>}>
          {selectedTab === "permissions" && "Permissions"}
        </Suspense>
      </TabsContent>
      <TabsContent value="articles">
        {articles.length < 1 ? (
          <div> NO articles found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <ArticleItem data={article} key={article.id} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

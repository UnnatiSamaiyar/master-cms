"use client";
import { useForm } from "react-hook-form";
import { AlertCircle, Check, Globe } from "lucide-react";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/submit-button";
import { useTransition } from "react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdType } from "@/types/ads";
import SearchInput from "../search-input";
import { Article } from "@/types/article";

interface ArticleAd extends Article {
  pushedArticle: string[];
}

interface FormValues {
  selectedArticles: string[];
  categories: Record<string, string>;
}

interface Props {
  articles: ArticleAd[];
  ad: AdType;
}

export default function AdsPushToArticleComp({ articles, ad }: Props) {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const { back } = useRouter();
  const token = session?.user.accessToken as string;
  const form = useForm<FormValues>({
    defaultValues: {
      selectedArticles: [],
      categories: {},
    },
  });

  const { watch, setValue, getValues } = form;
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");
  const selectedArticles = watch("selectedArticles");

  const handlearticleSelect = async (websiteId: string) => {
    const currentarticles = getValues("selectedArticles");

    if (currentarticles.includes(websiteId)) {
      setValue(
        "selectedArticles",
        currentarticles.filter((id) => id !== websiteId),
      );
    } else {
      setValue("selectedArticles", [...currentarticles, websiteId]);
    }
  };

  const handleSubmit = (values: FormValues) => {
    if (selectedArticles.length < 1) {
      return toast.error("Please select a article to push", toastOptions);
    }
    startTransition(async () => {
      const url = `/api/website-ads/push/articles/ads/${websiteId}`;
      const { message, error } = await apiClient.post(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adId: ad.id,
          articleIds: values.selectedArticles,
        }),
      });
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        form.reset();
        back();
      }
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold mb-4">
          Push "{ad.title}" Ad to articles
        </h1>
        <SearchInput placeholder="Search articles" className="max-w-md" />
      </div>

      <Form {...form}>
        <form className="space-y-3 " onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => {
              const isAlreadyPushed = article.pushedArticle.includes(ad.id);
              const isSelected = selectedArticles.includes(article.id);

              return (
                <div key={article.id} className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                      isAlreadyPushed ? "bg-yellow-50 border-yellow-200" : ""
                    } ${isSelected ? "border-blue-500" : ""}`}
                    onClick={() =>
                      !isAlreadyPushed && handlearticleSelect(article.id)
                    }
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">
                            {article.title}
                          </p>
                          {isAlreadyPushed && (
                            <div className="flex items-center text-yellow-600 text-sm">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Already pushed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <SubmitButton isPending={isPending}>Push</SubmitButton>
        </form>
      </Form>
    </div>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { Article } from "@/types/article";
import { Website } from "@/types/website";
import { AlertCircle, Check, Globe } from "lucide-react";
import WebsiteCategorySelector from "./website-category-selector";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/submit-button";
import { useTransition } from "react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WebsiteArticle extends Website {
  pushedArticles: string[];
}

interface FormValues {
  selectedWebsites: string[];
  categories: Record<string, string>;
}

interface Props {
  article: Article;
  websites: WebsiteArticle[];
}

export default function ArticlePushPage({ article, websites }: Props) {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const { back } = useRouter();
  const token = session?.user.accessToken as string;
  const form = useForm<FormValues>({
    defaultValues: {
      selectedWebsites: [],
      categories: {},
    },
  });

  const { watch, setValue, getValues } = form;

  const selectedWebsites = watch("selectedWebsites");
  const selectedCategories = watch("categories");

  const isPushDisabled =
    selectedWebsites.length === 0 ||
    selectedWebsites.some((websiteId) => !selectedCategories[websiteId]);

  const handleWebsiteSelect = async (websiteId: string) => {
    const currentWebsites = getValues("selectedWebsites");

    if (currentWebsites.includes(websiteId)) {
      setValue(
        "selectedWebsites",
        currentWebsites.filter((id) => id !== websiteId),
      );
    } else {
      setValue("selectedWebsites", [...currentWebsites, websiteId]);
    }
  };

  const handleSubmit = (values: FormValues) => {
    if (selectedWebsites.length < 1) {
      return toast.error("Please select a website to push", toastOptions);
    }
    startTransition(async () => {
      const url = `/api/website-article/push`;
      const { message, error } = await apiClient.post(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: article.id,
          ...values,
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
      <h1 className="text-2xl font-bold mb-4">
        Push "{article.title}" to Websites
      </h1>

      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
          {websites.map((website) => {
            const isAlreadyPushed = website.pushedArticles.includes(article.id);
            const isSelected = selectedWebsites.includes(website.id);

            return (
              <div
                key={website.id}
                className="space-y-2 grid grid-cols-3  gap-2"
              >
                <div
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                    isAlreadyPushed ? "bg-yellow-50 border-yellow-200" : ""
                  } ${isSelected ? "border-blue-500" : ""}`}
                  onClick={() =>
                    !isAlreadyPushed && handleWebsiteSelect(website.id)
                  }
                >
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">
                          {website.name}
                        </p>
                        {isAlreadyPushed && (
                          <div className="flex items-center text-yellow-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Already published
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
                {isSelected && (
                  <WebsiteCategorySelector
                    websiteId={website.id}
                    isSelected={isSelected}
                  />
                )}
              </div>
            );
          })}
          <SubmitButton isPending={isPending} disabled={isPushDisabled}>
            Push
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}

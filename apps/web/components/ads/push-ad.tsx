"use client";
import { useForm } from "react-hook-form";
import { Website } from "@/types/website";
import { AlertCircle, Check, Globe } from "lucide-react";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/submit-button";
import { useTransition } from "react";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdType } from "@/types/ads";
import SearchInput from "../search-input";

interface WebsiteAd extends Website {
  pushedAds: string[];
}

interface FormValues {
  selectedWebsites: string[];
  categories: Record<string, string>;
}

interface Props {
  ad: AdType;
  websites: WebsiteAd[];
}

export default function AdsPushComp({ ad, websites }: Props) {
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
      const url = `/api/ads/push`;
      const { message, error } = await apiClient.post(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adsId: ad.id,
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold mb-4">
          Push "{ad.title}" Ad to Websites
        </h1>
        <SearchInput placeholder="Search Websites" className="max-w-md" />
      </div>

      <Form {...form}>
        <form className="space-y-3 " onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {websites.map((website) => {
              const isAlreadyPushed = website.pushedAds.includes(ad.id);
              const isSelected = selectedWebsites.includes(website.id);

              return (
                <div key={website.id} className="space-y-2">
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

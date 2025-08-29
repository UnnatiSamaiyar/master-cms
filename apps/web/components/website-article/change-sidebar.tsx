"use client";
import React, { useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import SubmitButton from "@/components/submit-button";
import { toastOptions } from "@/lib/constant";
import { AdType } from "@/types/ads";
import { apiClient } from "@/lib/apiClient";
import { useSearchParams } from "next/navigation";

interface Props {
  ad: AdType;
}

const formSchema = z.object({
  isRightSideBar: z.boolean({ message: "RightSideBar is required" }),
  order: z.number({ message: "Please selec order" }),
});

type formValue = z.infer<typeof formSchema>;

export const ChangeArticleAdsForm = ({ ad }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [open, setopen] = React.useState<boolean>(false);
  const { data: session } = useSession();
  const isDisabled = session?.user.role === "content writer";
  const token = session?.user.accessToken as string;
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const form = useForm<formValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isRightSideBar: ad.isRightSideBar,
      order: ad.order,
    },
  });

  async function onSubmit(values: formValue) {
    if (!token) return;
    startTransition(async () => {
      const { error, message } = await apiClient.put(
        `/api/website-ads/articles/ads/${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values, articleAdId: ad.id }),
        },
      );
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        form.reset();
        setopen(false);
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setopen}>
      <PopoverTrigger
        disabled={isDisabled}
        className="py-1.5 text-sm bg-accent rounded-sm flex px-2 cursor-pointer w-full disabled:cursor-not-allowed"
      >
        Change Position
      </PopoverTrigger>
      <PopoverContent side="left" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isRightSideBar"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Where would you like to place the ad?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(JSON.parse(value))
                      }
                      defaultValue={JSON.stringify(field.value)}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Right Sidebar
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Left Sidebar
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select order of the ad</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(JSON.parse(value))
                      }
                      defaultValue={JSON.stringify(field.value)}
                      className="flex space-x-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal">1</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="2" />
                        </FormControl>
                        <FormLabel className="font-normal">2</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SubmitButton isPending={isPending}>Submit</SubmitButton>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

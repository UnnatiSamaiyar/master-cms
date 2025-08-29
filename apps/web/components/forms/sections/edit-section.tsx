"use client";
import React, { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/submit-button";
import useSectionStore from "@/store/sectionStore";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { Section } from "@/types/section";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  isMain: z.boolean().optional(),
});

interface Props {
  section: Section;
  onClose: (value: boolean) => void;
}

export default function EditsectionForm({ onClose, section }: Props) {
  const { selectedWebsite } = useSectionStore();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: section.name,
      isMain: section.isMain,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const url = `/api/websites/${selectedWebsite?.id}/sections`;

      const payload = {
        ...values,
        sectionId: section.id,
      };
      const { message, error } = await apiClient.put(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        form.reset();
        onClose(true);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your section name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isMain"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3">
              <FormLabel className="translate-y-1">
                Is it main section?
              </FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton isPending={isPending} className="w-full">
          Save
        </SubmitButton>
      </form>
    </Form>
  );
}

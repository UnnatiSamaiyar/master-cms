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
import useCategoryStore from "@/store/categoryStore";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";
import { Category } from "@/types/category";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

interface Props {
  onClose: (value: boolean) => void;
  data: Category;
}

export default function EditCategoryForm({ onClose, data }: Props) {
  const { selectedWebsite } = useCategoryStore();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const url = `/api/websites/${selectedWebsite?.id}/categories`;

      const payload = {
        ...values,
        categoryId: data.id,
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
                <Input placeholder="Enter your category name" {...field} />
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

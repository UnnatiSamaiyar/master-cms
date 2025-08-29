"use client";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SubmitButton from "@/components/submit-button";
import { useSession } from "next-auth/react";
import { addWebsites } from "@/action";
import { toast } from "sonner";
import { toastOptions } from "@/lib/constant";

// Define the schema using zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  domain: z
    .string()
    .min(1, { message: "Domain is required" })
    .regex(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/, {
      message: "Invalid domain format. Example: example.com",
    }),
  backendUrl: z
    .string()
    .min(1, { message: "Backend URL is required" })
    .refine((value) => !value.endsWith("/"), {
      message: "Backend URL should not end with '/'",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const AddWebsiteForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  const { data: session } = useSession();
  const token = session?.user.accessToken as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      domain: "",
      backendUrl: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      if (!token) return;
      const { error, success } = await addWebsites(token, data);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
        form.reset();
      }
    });
  };

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
                <Input placeholder="Enter website name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <Input placeholder="Enter website domain" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="backendUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backend URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter backend URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton className="w-full" isPending={isPending}>
          Submit
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AddWebsiteForm;

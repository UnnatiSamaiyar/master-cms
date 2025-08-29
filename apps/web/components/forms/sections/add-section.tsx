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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  isMain: z.boolean().optional(),
  layout: z.enum(["3", "1", "2", "5"]),
});

interface Props {
  onClose: (value: boolean) => void;
}

const layoutOptions = [
  {
    value: "3",
    label: "3 Columns",
    image: "/3col.png", // Placeholder image
  },
  {
    value: "1",
    label: "1 Row",
    image: "/1col.png", // Placeholder image
  },
  {
    value: "2",
    label: "2 Columns",
    image: "/2col.png", // Placeholder image
  },
  {
    value: "5",
    label: "2 Columns 2 Rows",
    image: "/2x2.png", // Placeholder image
  },
];

export default function AddsectionForm({ onClose }: Props) {
  const { selectedWebsite } = useSectionStore();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isMain: false,
      layout: "3",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const url = `/api/websites/${selectedWebsite?.id}/sections`;

      const payload = {
        ...values,
        layout: parseInt(values.layout as string),
      };
      const { message, error } = await apiClient.post(url, {
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
        {!form.watch("isMain") && (
          <FormField
            control={form.control}
            name="layout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Layout</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    {layoutOptions.map((option) => (
                      <FormItem
                        key={option.value}
                        className="relative space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="absolute opacity-0"
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor={option.value}
                          className={`
                            block cursor-pointer rounded-lg border-2 p-2 transition-all
                            ${
                              field.value === option.value
                                ? "border-primary scale-105 shadow-md"
                                : "border-transparent hover:border-gray-200"
                            }
                          `}
                        >
                          <div className="space-y-2">
                            <img
                              src={option.image}
                              alt={option.label}
                              className={`
                                h-32 w-full rounded-md object-cover transition-all
                                
                              `}
                            />
                            <span className="block text-center text-sm font-medium">
                              {option.label}
                            </span>
                          </div>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <SubmitButton isPending={isPending} className="w-full">
          Save
        </SubmitButton>
      </form>
    </Form>
  );
}

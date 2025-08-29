"use client";
import React, { Fragment } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { User } from "next-auth";
import { apiClient } from "@/lib/apiClient";
import { toastOptions } from "@/lib/constant";
import { Loader2 } from "lucide-react";

const changeNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be atleast 4 character long." })
    .max(50, { message: "Name should be less than 50 character long." }),
});

type ChangeNameInput = z.infer<typeof changeNameSchema>;

interface Props {
  data: User;
}

export default function ChangeName({ data }: Props) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { data: session, update } = useSession();
  const token = session?.user.accessToken as string;
  const form = useForm<ChangeNameInput>({
    resolver: zodResolver(changeNameSchema),
    defaultValues: {
      name: data.name || "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: ChangeNameInput) => {
    try {
      setIsLoading((prevState) => !prevState);
      const { message, error, data } = await apiClient.put(
        `/api/admins/change/name`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...values }),
        },
      );
      setIsLoading((prevState) => !prevState);
      if (error) return toast.error(error, toastOptions);
      toast.success(message, toastOptions);
      update({
        ...session,
        user: {
          ...session?.user,
          name: data ?? values.name,
        },
      });
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Fragment>
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              please wait
            </Fragment>
          ) : (
            "Save"
          )}
        </Button>
      </form>
    </Form>
  );
}

"use client";
import React, { Fragment, useState } from "react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const EmailSchema = z.object({
  email: z.string().email({ message: "Please enter valid email address" }),
});

type EmailInput = z.infer<typeof EmailSchema>;

export default function PasswordResetrequest() {
  const form = useForm<EmailInput>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });
  const [isLoading, setisLoading] = useState(false);

  const onSubmit = async (values: EmailInput) => {
    try {
      setisLoading((prevState) => !prevState);
      const { message, error } = await apiClient.post(
        `/api/admins/password/reset/request`,
        {
          body: JSON.stringify({ ...values }),
        },
      );
      setisLoading((prevState) => !prevState);
      if (error) {
        return toast.error(error);
      }
      toast.success(message, {
        duration: 5000,
      });
      form.reset();
    } catch (error: any) {
      setisLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your current email"
                  {...field}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isLoading ? (
            <Fragment>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              please wait...
            </Fragment>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}

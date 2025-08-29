"use client";
import React, { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(6, { message: "Code should be 6 digit." })
      .max(6, { message: "Code should be 6 digit." }),
    password: z
      .string()
      .min(8, {
        message: "password must be at least 8 characters long",
      })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
        message:
          "password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password doesn't match.",
    path: ["confirmPassword"],
  });

export type Inputs = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordform() {
  const [isLoading, setisLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const form = useForm<Inputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
      code: "",
    },
  });
  const onSubmit = async (values: Inputs) => {
    if (!email) return;
    setisLoading((prevState) => !prevState);
    const resetData = {
      email,
      ...values,
    };
    const { message, error } = await apiClient.post(
      `/api/admins/password/reset/verification`,
      {
        body: JSON.stringify(resetData),
      },
    );
    setisLoading((prevState) => !prevState);
    if (error) return toast.error(error);
    form.reset();
    toast.success(message);
    router.push("/auth/login");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password reset code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input placeholder="Re-enter you password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <Button disabled={isLoading}>
          {isLoading ? (
            <Fragment>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Please wait</span>
            </Fragment>
          ) : (
            <span>Submit</span>
          )}
        </Button>
      </form>
    </Form>
  );
}

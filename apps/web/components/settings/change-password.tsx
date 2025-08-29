"use client";
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
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/lib/apiClient";
import { toastOptions } from "@/lib/constant";
import { Loader2 } from "lucide-react";

const PasswordSchema = z
  .object({
    password: z.string().min(1, { message: "Password can't be empty." }),
    confirmPassword: z.string(),
    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password doesn't match.",
    path: ["confirmPassword"],
  });

export type changePasswordInput = z.infer<typeof PasswordSchema>;

export default function ChangePassword() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const form = useForm<changePasswordInput>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: changePasswordInput) {
    try {
      setIsLoading((prevState) => !prevState);
      const { message, error } = await apiClient.put(
        `/api/admins/change/password`,
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
      form.reset();
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your old password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Confirm password</FormLabel>
              <FormControl>
                <Input placeholder="Confirm your password" {...field} />
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
            "Change password"
          )}
        </Button>
      </form>
    </Form>
  );
}

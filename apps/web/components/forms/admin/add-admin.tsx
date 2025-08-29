"use client";
import React, { useTransition } from "react";
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
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubmitButton from "@/components/submit-button";
import { adminRoleEnum } from "@/types/admin";
import { addAdmin } from "@/action";
import { toastOptions } from "@/lib/constant";
import useUIStore from "@/store/uiStore";

export const addAdminSchema = z
  .object({
    email: z.string().email({ message: "Please enter valid email address" }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      }),
    role: z.nativeEnum(adminRoleEnum, { message: "Role cannot be empty." }),
    name: z
      .string()
      .min(4, { message: "Name must be atleast 4 characters long." })
      .max(50, { message: "Name should be less than 50 characters." }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password does not match.",
  });

type Inputs = z.infer<typeof addAdminSchema>;

export const AddAdminForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<Inputs>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
      password: "",
      role: undefined,
      name: "",
      confirmPassword: "",
    },
  });

  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const { adminAddSheetOpen, adminAddSheetChange } = useUIStore();

  const onSubmit = async (values: Inputs) => {
    if (!token) return;

    startTransition(async () => {
      const { success, error } = await addAdmin(token, values);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
        form.reset();
        adminAddSheetChange(!adminAddSheetOpen);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 my-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter you email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    value={adminRoleEnum.admin}
                    className="capitalize"
                  >
                    {adminRoleEnum.admin}
                  </SelectItem>
                  <SelectItem
                    value={adminRoleEnum.subadmin}
                    className="capitalize"
                  >
                    {adminRoleEnum.subadmin}
                  </SelectItem>
                  <SelectItem
                    value={adminRoleEnum.contentwriter}
                    className="capitalize"
                  >
                    {adminRoleEnum.contentwriter}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter you password" {...field} />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="Re-Enter you password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isPending={isPending}>Submit</SubmitButton>
      </form>
    </Form>
  );
};

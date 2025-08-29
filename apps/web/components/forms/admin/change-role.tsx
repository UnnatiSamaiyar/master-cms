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
import { changeRole } from "@/action";
import { toast } from "sonner";
import { adminRoleEnum, adminType } from "@/types/admin";
import SubmitButton from "@/components/submit-button";
import { toastOptions } from "@/lib/constant";

interface Props {
  admin: adminType;
}

const formSchema = z.object({
  role: z.nativeEnum(adminRoleEnum, { message: "Role cannot be empty." }),
});

type roleInputType = z.infer<typeof formSchema>;

export const ChangeRoleForm = ({ admin }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [open, setopen] = React.useState<boolean>(false);
  const { data: session } = useSession();
  const isDisabled = session?.user.role !== "admin";
  const token = session?.user.accessToken as string;

  const form = useForm<roleInputType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: admin.role as adminRoleEnum,
    },
  });

  async function onSubmit(values: roleInputType) {
    if (!token) return;
    startTransition(async () => {
      const changeRoleData = {
        adminId: admin.id,
        ...values,
      };
      const { success, error } = await changeRole(token, changeRoleData);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
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
        Change Role
      </PopoverTrigger>
      <PopoverContent side="left" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Change Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {Object.values(adminRoleEnum).map((item, index) => (
                        <FormItem
                          className="flex items-center space-x-3 space-y-0"
                          key={index}
                        >
                          <FormControl>
                            <RadioGroupItem value={item} />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {item}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <SubmitButton isPending={isPending}>Submit</SubmitButton>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

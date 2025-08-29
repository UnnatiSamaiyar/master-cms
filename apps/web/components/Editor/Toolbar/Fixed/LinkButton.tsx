import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSlate } from "slate-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toggleLink } from "../../utils/toggleLink";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Link } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormSchema = z.object({
  link: z.string().url({ message: "Please enter valid url." }),
});

export default function LinkButton() {
  const [open, setopen] = React.useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      link: "",
    },
  });

  const editor = useSlate();

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    toggleLink(editor, data.link);
    form.reset();
    setopen(!open);
  };

  return (
    <Tooltip>
      <Popover open={open} onOpenChange={setopen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <PopoverContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Paste your link here"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
      <TooltipContent>Insert Link</TooltipContent>
    </Tooltip>
  );
}

import React from "react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Image, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MyImageELement } from "@/types/slate-custom-type";
import { nanoid } from "nanoid";
import { insertBlock } from "../../utils/insertBlock";
import { Transforms } from "slate";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BASE_URL, toastOptions } from "@/lib/constant";
import { useSession } from "next-auth/react";
import { httpStatusCode } from "@/types/http";
import { toast } from "sonner";

const FormSchema = z.object({
  link: z.string().url({ message: "Please enter valid url." }),
});

export default function ImageButton() {
  const [isLoading, setisLoadingToggle] = React.useState(false);
  const [open, setopen] = React.useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      link: "",
    },
  });

  const { data: session } = useSession();

  const editor = useSlate();

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const ImageELement: MyImageELement = {
      id: nanoid(),
      type: "img",
      url: data.link,
      children: [{ text: "" }],
    };
    insertBlock(editor, ImageELement);
    form.reset();
    setopen(!open);
  };

  const Imageupload = async (file: File) => {
    setisLoadingToggle(true);
    if (file) {
      const formData = new FormData();
      formData.set("image", file);
      const response = await fetch(`${BASE_URL}/api/articles/content/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      });
      const { statusCode, message, data } = await response.json();
      if (statusCode !== httpStatusCode.OK) {
        return toast.error(message, toastOptions);
      }

      const ImageElement: MyImageELement = {
        id: nanoid(),
        url: data,
        children: [{ text: "" }],
        type: "img",
      };
      insertBlock(editor, ImageElement);
      setisLoadingToggle(false);
    }
  };

  return (
    <Tooltip>
      <Popover open={open} onOpenChange={setopen}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <PopoverContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="embed-link">Embed Link</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              {!isLoading ? (
                <div className="flex items-center space-x-2 pt-4">
                  <Label
                    htmlFor="file"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "cursor-pointer w-full",
                    )}
                  >
                    Upload file
                  </Label>
                  <input
                    type="file"
                    hidden
                    id="file"
                    onChange={(e) => {
                      e.preventDefault();
                      e.target.files && Imageupload(e.target.files[0]);
                    }}
                  />
                </div>
              ) : (
                <Button
                  disabled
                  className="w-full cursor-not-allowed"
                  variant={"outline"}
                >
                  <Loader2 className="mr-2 animate-spin" />
                  Please wait
                </Button>
              )}
            </TabsContent>
            <TabsContent value="embed-link">
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
                        <FormLabel>Image Link</FormLabel>
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
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <TooltipContent>Insert Image</TooltipContent>
    </Tooltip>
  );
}

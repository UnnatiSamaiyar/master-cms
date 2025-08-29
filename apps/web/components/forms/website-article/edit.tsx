"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { toastOptions } from "@/lib/constant";
import { Article } from "@/types/article";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import SubmitButton from "@/components/submit-button";
import { apiClient } from "@/lib/apiClient";

interface Props {
  article: Article;
  websiteId: string;
  closeDropDown: (value: boolean) => void;
}

export const formSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Title should be atleast 10 characters." })
    .max(80, { message: "Title can't be longer than 80 character." }),
  description: z
    .string()
    .min(10, { message: "Description should be atleast 10 characters." })
    .max(300, {
      message: "Description can't be longer than 300 character.",
    }),
  imageUrl: z.string().url({ message: "Please enter a valid url." }),
});

type ArticleInputValues = z.infer<typeof formSchema>;

interface tagsObject {
  id: string;
  name: string;
}

export default function WebsiteEditArticle({
  article,
  websiteId,
  closeDropDown,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = React.useTransition();
  const [tags, settags] = useState<string>("");
  const [tagsArray, setTagsArray] = useState<tagsObject[]>([]);

  const form = useForm<ArticleInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article.title,
      description: article.description,
      imageUrl: article.imageUrl,
    },
  });

  const generateUniqueId = () => crypto.randomUUID();

  useEffect(() => {
    if (article.tags) {
      setTagsArray(
        article.tags.map((tag) => ({ id: generateUniqueId(), name: tag })),
      );
    }
  }, [article]);

  const handleAddTag = useCallback(
    (name: string) => {
      const isTagExist = tagsArray.some((item) => item.name === name);
      if (isTagExist) {
        return toast(`${name} already exists.`);
      }
      setTagsArray((prevState) => [
        ...prevState,
        { id: generateUniqueId(), name },
      ]);
      settags("");
    },
    [tagsArray],
  );

  const handleRemoveTags = useCallback((id: string) => {
    setTagsArray((prevState) => prevState.filter((item) => item.id !== id));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tags.trim()) {
      e.preventDefault();
      handleAddTag(tags);
    }
  };

  async function onSubmit(values: ArticleInputValues) {
    if (!token || !article) return;
    if (tagsArray.length < 5)
      return toast.info("Please add 5 tags", toastOptions);
    startTransition(async () => {
      const tags = tagsArray.map((item) => item.name);

      const articleData = {
        articleId: article.id,
        ...values,
        tags,
      };

      const { message, error } = await apiClient.put(
        `/api/website-article/website/${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(articleData),
        },
      );
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        form.reset();
        setOpen(!open);
        closeDropDown(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Edit name</DialogTitle>
          <DialogDescription>
            Make changes to the name here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("grid item-start gap-4")}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Battle between SQL and NOSQL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Url</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your image url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="The Battle between SQL and NoSQL: Choosing the Right Database for Your Web Application."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="relative">
              <div
                className={cn(
                  "border bg-accent rounded-md border-input flex flex-wrap items-center px-2 py-1 space-y-1",
                )}
              >
                <div className="flex flex-wrap gap-1 items-center">
                  {tagsArray.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-6 px-1",
                      )}
                    >
                      <span className="capitalize">{item.name}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTags(item.id);
                        }}
                        className="cursor-pointer"
                      >
                        <X size={14} />
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="outline-none px-1.5 py-2 h-10 my-1 text-sm bg-transparent w-full placeholder:text-muted-foreground placeholder:text-sm"
                  placeholder="Add article tags"
                  value={tags}
                  disabled={tagsArray.length >= 10}
                  onChange={(e) => settags(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <FormDescription className="my-2">
                Press enter after writing tag name for adding a tag.
              </FormDescription>
            </div>

            <SubmitButton isPending={isPending}>Submit</SubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

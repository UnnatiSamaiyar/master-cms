"use client";
import { Article } from "@/types/article";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import SubmitButton from "@/components/submit-button";
import { AlertCircle, FileCheck, Upload, X } from "lucide-react";
import { publishArticle } from "@/action";
import { toastOptions } from "@/lib/constant";
import { apiClient } from "@/lib/apiClient";
import { useDropzone } from "react-dropzone";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const publishArticleSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Title should be atleast 10 characters." })
    .max(80, { message: "Title can't be longer than 80 character." }),
  description: z
    .string()
    .min(10, { message: "Description should be atleast 10 characters." })
    .max(500, {
      message: "Description can't be longer than 500 character.",
    }),
  imageUrl: z.string().optional(),
});

interface Props {
  article: Article;
}

type publishArticleInput = z.infer<typeof publishArticleSchema>;

interface tagsObject {
  id: string;
  name: string;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const PublishArticleForm = ({ article }: Props) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<publishArticleInput>({
    resolver: zodResolver(publishArticleSchema),
    defaultValues: {
      imageUrl: article.imageUrl || "",
      title: article.title || "",
      description: article.description || "",
    },
  });

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setfile] = useState<File | null>(null);

  const [tags, settags] = useState<string>("");
  const [tagsArray, setTagsArray] = useState<tagsObject[]>([]);
  const { data: session } = useSession();
  const token = session?.user?.accessToken as string;
  const { back } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const generateUniqueId = () => crypto.randomUUID();

  useEffect(() => {
    if (article.isPublished) {
      back();
    }
    if (article.tags) {
      setTagsArray(
        article.tags.map((tag) => ({ id: generateUniqueId(), name: tag })),
      );
    }
  }, [article, back]);

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

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError("File is too large. Maximum size is 4 MB.");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Invalid file type. Please upload a CSV file.");
      } else {
        setError("Error uploading file. Please try again.");
      }
      setFileName(null);
    } else if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      setfile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  async function onSubmit(values: publishArticleInput) {
    if (!token) return;
    if (tagsArray.length < 5) {
      return toast.info("Please add 5 tags");
    }

    if (pathname.startsWith("/dashboard/articles") && isEditingImage && !file) {
      return toast.error("Please upload image", toastOptions);
    }

    startTransition(async () => {
      const tags = tagsArray.map((item) => item.name);
      const publishData = {
        articleId: article.id,
        ...values,
        tags,
      };

      if (pathname.startsWith("/dashboard/articles")) {
        const formData = new FormData();
        formData.set("title", values.title);
        formData.set("description", values.description);
        if (isEditingImage) {
          formData.set("image", file as any);
        }
        formData.set("isNewImage", JSON.stringify(isEditingImage));
        formData.set("tags", JSON.stringify(tags));
        formData.set("articleId", article.id);
        formData.set("imageUrl", article.imageUrl);
        const { error, success } = await publishArticle(token, formData);
        if (error) {
          toast.error(error, toastOptions);
        } else {
          toast.success(success, toastOptions);
          form.reset();
          setTagsArray([]);
          settags("");
          back();
        }
      } else {
        const url = `/api/website-article/website/${websiteId}/publish`;
        const { error, message } = await apiClient.post(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(publishData),
        });
        if (error) {
          toast.error(error, toastOptions);
        } else {
          toast.success(message, toastOptions);
          form.reset();
          setTagsArray([]);
          settags("");
          back();
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8"
      >
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                These article details will become your SEO details. Please fill
                them correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your article title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!pathname.startsWith("/dashboard/articles") && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Url</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your article image url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {pathname.startsWith("/dashboard/articles") && (
                  <Fragment>
                    <div className="grid gap-4">
                      <h1>Would you like to change the existing image?</h1>
                      <RadioGroup
                        onValueChange={(value) =>
                          setIsEditingImage(value === "yes")
                        }
                        defaultValue={isEditingImage ? "yes" : "no"}
                        className="flex items-center space-x-5"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="r1" />
                          <Label htmlFor="r1">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="r2" />
                          <Label htmlFor="r2">No</Label>
                        </div>
                      </RadioGroup>{" "}
                    </div>

                    {!isEditingImage && (
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Url</FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                placeholder="Enter your article image url"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {isEditingImage && (
                      <div
                        {...getRootProps()}
                        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
        ${error ? "border-red-500 bg-red-50" : ""}
      `}
                      >
                        <input {...getInputProps()} />
                        <div className="space-y-4">
                          {error ? (
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                          ) : fileName ? (
                            <FileCheck className="mx-auto h-12 w-12 text-green-500" />
                          ) : (
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          )}
                          <p className="text-sm text-gray-600">
                            {error ? (
                              <span className="text-red-500">{error}</span>
                            ) : fileName ? (
                              <span className="text-green-500">
                                File selected: {fileName}
                              </span>
                            ) : isDragActive ? (
                              "Drop the CSV file here..."
                            ) : (
                              "Drag 'n' drop an image file here, or click to select one"
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            (Max file size: 4 MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article Description</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Enter your article description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Article Tags</CardTitle>
              <CardDescription>
                These tags will become your seo keywords choose wisely.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                {tagsArray.length >= 10 && (
                  <p className="text-xs text-red-500">
                    You can add only 10 tags.
                  </p>
                )}
                <FormDescription className="my-2">
                  Press enter after writing tag name for adding a tag.
                </FormDescription>
              </div>
            </CardContent>
          </Card>
        </div>
        <SubmitButton className="w-fit" isPending={isPending}>
          Publish
        </SubmitButton>
      </form>
    </Form>
  );
};

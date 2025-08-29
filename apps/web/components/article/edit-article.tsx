"use client";
import React, { useCallback, useState, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
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
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { toastOptions } from "@/lib/constant";
import { Article } from "@/types/article";
import { updateArticle } from "@/action";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import SubmitButton from "../submit-button";
import { useDropzone } from "react-dropzone";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileCheck, Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

interface Props {
  article: Article;
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

export default function EditArticle({ article, closeDropDown }: Props) {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [isPending, startTransition] = React.useTransition();

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setfile] = useState<File | null>(null);

  const form = useForm<ArticleInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article.title,
      description: article.description,
      imageUrl: article.imageUrl,
    },
  });

  async function onSubmit(values: ArticleInputValues) {
    if (!token || !article) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("description", values.description);
      if (isEditingImage) {
        formData.set("image", file as any);
      }
      formData.set("isNewImage", JSON.stringify(isEditingImage));
      formData.set("articleId", article.id);
      formData.set("imageUrl", article.imageUrl);

      const { success, error } = await updateArticle(token, formData);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
        form.reset();
        setOpen(!open);
        closeDropDown(false);
      }
    });
  }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Edit className="w-4 h-4" />
          Edit Article
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
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
            <Fragment>
              <div className="grid gap-4">
                <h1>Would you like to change the existing image?</h1>
                <RadioGroup
                  onValueChange={(value) => setIsEditingImage(value === "yes")}
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="The Battle between SQL and NoSQL: Choosing the Right Database for Your Web Application."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SubmitButton isPending={isPending}>Submit</SubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

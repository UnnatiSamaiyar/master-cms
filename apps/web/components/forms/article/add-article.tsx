import { useSession } from "next-auth/react";
import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { cn } from "@/lib/utils";
import SubmitButton from "@/components/submit-button";
import { addArticle } from "@/action";
import { toastOptions } from "@/lib/constant";
import { useDropzone } from "react-dropzone";
import { AlertCircle, FileCheck, Upload } from "lucide-react";

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
});

type ArticleInputValues = z.infer<typeof formSchema>;

interface Props {
  closeDrawer: (value: boolean) => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export function AddArticleForm({
  closeDrawer,
  className,
}: React.ComponentProps<"form"> & Props) {
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setfile] = useState<File | null>(null);

  const session = useSession();
  const token = session.data?.user.accessToken as string;
  const form = useForm<ArticleInputValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file) return toast.error("Please upload image");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("image", file);
      const { error, success } = await addArticle(token, formData);
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(success, toastOptions);
        form.reset();
        closeDrawer(true);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid item-start gap-4", className)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Battle between SQL and NOSQL" {...field} />
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
            <p className="text-xs text-gray-400">(Max file size: 4 MB)</p>
          </div>
        </div>

        <SubmitButton isPending={isPending}>Submit</SubmitButton>
      </form>
    </Form>
  );
}

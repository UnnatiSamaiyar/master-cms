"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition, useCallback, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, FileCheck, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { BASE_URL, toastOptions } from "@/lib/constant";
import SubmitButton from "@/components/submit-button";
import { httpStatusCode } from "@/types/http";

const AdSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title must be atleast 4 characters long." })
    .max(50, { message: "Title should be less than 50 characters." }),
  targetUrl: z.string().url({ message: "Please provide valid targetUrl url" }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
});

export type adsFormValue = z.infer<typeof AdSchema>;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB in bytes
export function AddAdsForm() {
  const form = useForm<adsFormValue>({
    resolver: zodResolver(AdSchema),
    defaultValues: {
      title: "",
      targetUrl: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setfile] = useState<File | null>(null);
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;

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

  function onSubmit(data: adsFormValue) {
    if (!file) return toast.error("Please upload image");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("targetUrl", data.targetUrl);
      formData.set("startDate", format(data.startDate, "yyyy-MM-dd"));
      formData.set("endDate", format(data.endDate, "yyyy-MM-dd"));
      formData.set("title", data.title);
      formData.set("image", file);
      const response = await fetch(`${BASE_URL}/api/ads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const { statusCode, message } = await response.json();
      if (statusCode !== httpStatusCode.OK) {
        toast.error(message, toastOptions);
      } else {
        toast.success(message, toastOptions);
        form.reset();
        setfile(null);
        setFileName(null);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Url</FormLabel>
                <FormControl>
                  <Input placeholder="Enter target url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value as any}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value as any}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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

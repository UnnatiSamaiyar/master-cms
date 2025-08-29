import { apiClient } from "@/lib/apiClient";
import { toastOptions } from "@/lib/constant";
import { Category } from "@/types/category";
import { useSession } from "next-auth/react";
import React, { Fragment, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

interface Props {
  websiteId: string;
  isSelected: boolean;
}

export default function WebsiteCategorySelector({
  websiteId,
  isSelected,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const [selectedCategory, setSelectedCateogry] = useState<string>();

  const { control, getValues, setValue } = useFormContext();

  useEffect(() => {
    startTransition(async () => {
      if (isSelected) {
        const url = `/api/websites/${websiteId}/categories`;
        const { data, error } = await apiClient.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (error) {
          toast.error(error, toastOptions);
        }
        setCategories(data || []);
      }
    });
  }, [websiteId, isSelected]);

  const handleCategoryChange = async (websiteId: string, category: string) => {
    setValue("categories", {
      ...getValues("categories"),
      [websiteId]: category,
    });
  };

  return (
    <Fragment>
      {isPending ? (
        <div>loading...</div>
      ) : (
        <Fragment>
          <div className="space-y-1 w-full">
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCateogry}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <FormField
              control={control}
              name={`categories.${websiteId}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub category</FormLabel>
                  <Select
                    disabled={!selectedCategory}
                    defaultValue={field.value}
                    onValueChange={(e) => handleCategoryChange(websiteId, e)}
                  >
                    <FormControl>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select a sub category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories
                        .find(
                          (category) =>
                            category.id === (selectedCategory as string),
                        )
                        ?.subcategories.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

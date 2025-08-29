"use client";
import React, { useState, useTransition } from "react";
import { Category } from "@/types/category";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CategoryCard from "./category-card";
import SearchInput from "../search-input";
import AddCategorymodal from "./add-modal";
import useCategoryStore from "@/store/categoryStore";
import { Website } from "@/types/website";
import { ChevronRight, Globe, RefreshCw, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { useSession } from "next-auth/react";

interface Props {
  websites: Website[];
}

const Categories = ({ websites }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { selectedWebsite, onSelected } = useCategoryStore();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const pathname = usePathname();

  const selectedWebsiteData = websites.find(
    (website) => website.id === selectedWebsite?.id,
  );

  const fetchCategories = async (websiteId: string) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      const url = `/api/websites/${websiteId}/categories`;
      const { data, error } = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (error) {
        toast.error(error);
        return;
      }

      setCategories(data);
      setError(null);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Failed to fetch categories. Please try again.");
        toast.error("Failed to fetch categories. Please try again.");
      }
    } finally {
      // Cleanup AbortController
      return () => abortController.abort();
    }
  };

  const handleWebsiteSelect = (website: Website) => {
    window.history.replaceState(null, "", pathname);
    onSelected(website);
    startTransition(async () => {
      fetchCategories(website.id);
    });
  };

  const handleRefetch = () => {
    if (selectedWebsite) {
      startTransition(async () => {
        fetchCategories(selectedWebsite.id);
      });
    }
  };

  if (!selectedWebsite) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Select a Website
            </h2>
            <p className="text-gray-600 mt-1">
              Choose a website to manage its categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <SearchInput
                placeholder="Search website"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Website List */}
          <div className="space-y-3">
            {websites.length > 0 ? (
              websites.map((website) => (
                <button
                  key={website.id}
                  onClick={() => handleWebsiteSelect(website)}
                  className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {website.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-gray-600">
                No website found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
              {selectedWebsiteData?.name}
            </span>
          </div>
          <p className="text-gray-600">
            Manage categories and subcategories for {selectedWebsiteData?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefetch}
            disabled={isPending}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {isPending ? "Refreshing..." : "Refetch"}
          </Button>
          <Button variant="outline" onClick={() => onSelected(null)}>
            Change Website
          </Button>
          <AddCategorymodal />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}

      {/* Categories List */}
      {!isPending && (
        <>
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              No categories found for this website.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Categories;

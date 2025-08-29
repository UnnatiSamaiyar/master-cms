"use client";
import React, { useState, useTransition } from "react";
import {
  LayoutGrid,
  Globe,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";
import useSectionStore from "@/store/sectionStore";
import { Website } from "@/types/website";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import SearchInput from "../search-input";
import { Button } from "../ui/button";
import { Section } from "@/types/section";
import Link from "next/link";
import SectionArticle from "./section-article";
import AddSectionModal from "./add-modal";
import EditSectionModal from "./edit-modal";
import Deletesection from "./delete-section";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import layout from "@/app/dashboard/layout";

interface Props {
  websites: Website[];
}

const Sections = ({ websites }: Props) => {
  const [sections, setSection] = useState<Section[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { selectedWebsite, onSelected } = useSectionStore();
  const pathname = usePathname();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;

  const selectedWebsiteData = websites.find(
    (website) => website.id === selectedWebsite?.id,
  );

  const fetchSections = async (websiteId: string) => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    try {
      const url = `/api/websites/${websiteId}/sections`;
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

      setSection(data.sections);
      setError(null);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Failed to fetch sections. Please try again.");
        toast.error("Failed to fetch sections. Please try again.");
      }
    } finally {
      return () => abortController.abort();
    }
  };

  const handleWebsiteSelect = (website: Website) => {
    window.history.replaceState(null, "", pathname);
    onSelected(website);
    startTransition(async () => {
      await fetchSections(website.id);
    });
  };

  const handleRefetch = () => {
    if (selectedWebsite) {
      startTransition(async () => {
        await fetchSections(selectedWebsite.id);
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
              Choose a website to manage its sections
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

          <div className="space-y-3">
            {websites.map((website) => (
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
            ))}
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
            <h1 className="text-2xl font-bold text-gray-800">Sections</h1>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
              {selectedWebsiteData?.name}
            </span>
          </div>
          <p className="text-gray-600">
            Manage dynamic sections for {selectedWebsiteData?.name}
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
          <AddSectionModal />
        </div>
      </div>
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-lg mr-3" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}

      {!isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white group rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      {section.layout}
                    </div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-800">
                        {section.name}
                      </h3>
                      {section.isMain && <Badge>Main</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditSectionModal section={section} />
                    <Deletesection section={section} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {section.articleCount}
                      </span>{" "}
                      articles
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="link"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Link
                      href={`/dashboard/sections/${section.id}?websiteId=${selectedWebsiteData?.id}`}
                    >
                      Manage Articles
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  <SectionArticle sectionId={section.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sections;

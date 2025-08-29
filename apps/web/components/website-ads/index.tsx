"use client";
import React, { useEffect, useState } from "react";
import { Globe, ChevronRight, Search } from "lucide-react";
import { Website } from "@/types/website";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import SearchInput from "../search-input";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { AdType } from "@/types/ads";
import ErrorFallback from "../ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { WebsiteAdsDataTable } from "./data-table";
import { WebsiteadsColumns } from "./ads-column";
import { Card, CardContent, CardHeader } from "../ui/card";
import Link from "next/link";

const PaginationComponent = dynamic(() => import("../pagination-controller"));
const PerRowSelect = dynamic(() => import("../per-row-select"));

interface Props {
  websites: Website[];
}

const WebsiteAds = ({ websites }: Props) => {
  const [Ads, setAds] = useState<AdType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [totalCount, settotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const perRow = searchParams.get("perRow") || 10;

  useEffect(() => {
    if (!selectedWebsite) return;
    setIsLoading(true);
    setError(null);

    const fetchAds = async () => {
      try {
        const page = searchParams.get("page") || 1;
        const search = searchParams.get("query") || "";
        const perRow = searchParams.get("perRow") || 10;

        const url = `/api/ads/admin?page=${page}&perRow=${perRow}&search=${search}`;
        const { data, error } = await apiClient.get(url, {
          baseUrl: selectedWebsite.backendUrl,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (error) {
          throw new Error(error);
        }
        setAds(data.ads);
        settotalCount(data.totalCount);
      } catch (err: any) {
        setError("Failed to fetch Ads. Please try again.");
        toast.error("Failed to fetch Ads. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [selectedWebsite, searchParams]); // Only trigger on searchParams change

  useEffect(() => {
    return () => {
      setSelectedWebsite(null);
    };
  }, []);

  const handleWebsiteSelect = (website: Website) => {
    window.history.replaceState(
      null,
      "",
      `${pathname}?websiteId=${website.id}`,
    );
    setSelectedWebsite(website);
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
              Choose a website to manage its Ads
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
            <h1 className="text-2xl font-bold text-gray-800">Ads</h1>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
              {selectedWebsite?.name}
            </span>
          </div>
          <p className="text-gray-600">
            Manage Ads for {selectedWebsite?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <SearchInput placeholder="Search your Ads" className="md:min-w-96" />
          <Button disabled={Ads.length === 4}>
            <Link
              href={`/dashboard/website-ads/add?websiteId=${selectedWebsite.id}`}
            >
              Add Ad
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setSelectedWebsite(null)}>
            Change Website
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}

      {/* Ads List */}
      {!isLoading && (
        <>
          {Ads.length < 1 ? (
            <div className="text-center my-10">No Ads found</div>
          ) : (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Card>
                <CardHeader></CardHeader>
                <CardContent>
                  <WebsiteAdsDataTable columns={WebsiteadsColumns} data={Ads} />
                </CardContent>
              </Card>
            </ErrorBoundary>
          )}
        </>
      )}

      {/* Pagination and Rows Per Page */}
      {totalCount > 1 && (
        <div className="my-5 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          <PerRowSelect />
          {totalCount > Number(perRow) && (
            <div>
              <PaginationComponent totalResults={totalCount} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteAds;

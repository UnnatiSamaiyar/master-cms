import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import { Website } from "@/types/website";
import { Globe } from "lucide-react";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function page({ params }: Props) {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const id = (await params).id;
  const { data, error } = await apiClient.get(
    `/api/admins/${id}/assigned/websites`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (error) return <div>{error}</div>;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold">Assigned Websites</h1>
      {data.length < 1 ? (
        <div className="flex justify-center my-5">
          <h1 className="font-bold">No website assigned</h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((website: Website) => (
            <div
              key={website.id}
              className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">{website.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

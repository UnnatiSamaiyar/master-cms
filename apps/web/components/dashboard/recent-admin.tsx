import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import React from "react";
import { CardDescription } from "../ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { adminType } from "@/types/admin";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { shortName } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function RecentAdmins() {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const { data, error } = await apiClient.get(`/api/admins/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return <div className="text-center">{error}</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Admins
            </h3>
          </div>
          <Button disabled={session?.user.role !== "admin"} variant="link">
            <Link href="/dashboard/admins">Manage Admins</Link>
          </Button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {data.map((admin: adminType) => (
          <div
            key={admin.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="uppercase">
                  {shortName(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">
                  {admin.name}
                </h4>
                <CardDescription>{admin.email}</CardDescription>
              </div>
              <Badge variant="outline" className="py-2 capitalize">
                {admin.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

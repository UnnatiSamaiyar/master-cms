import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Globe } from "lucide-react";

export default async function Totalwebsite() {
  const session = await auth();
  const token = session?.user.accessToken as string;
  const { data, error } = await apiClient.get(`/api/websites/total`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return <p className="text-center">{error}</p>;
  }
  return (
    <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Total Websites</CardTitle>
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <Globe className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.count}</div>
      </CardContent>
    </Card>
  );
}

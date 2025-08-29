import { auth } from "@/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { cn, shortName } from "@/lib/utils";
import { adminType } from "@/types/admin";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Assigned Admins",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function page({ params }: Props) {
  const sesssion = await auth();
  const token = sesssion?.user.accessToken as string;
  const id = (await params).id;
  const { data, error } = await apiClient.get(
    `/api/websites/admin?websiteId=${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (error) {
    return <div>{error}</div>;
  }

  const assignedAdmins = data.filter((item: any) => item.assigned);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold">Assigned Admins</h1>
      {assignedAdmins.length < 1 ? (
        <div className="flex text-center justify-center my-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              You didn't assigned any admins yet.
            </h1>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {assignedAdmins.map((admin: adminType) => (
            <Card key={admin.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn("text-primary uppercase")}>
                      {shortName(admin.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{admin.name}</CardTitle>
                    <CardDescription>{admin.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge
                      variant={admin.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {admin.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { Metadata } from "next";
import React from "react";
import { auth } from "@/auth";
import { apiClient } from "@/lib/apiClient";
import RemoveAssignedAdmins from "@/components/websites/remove-assign-admin";

export const metadata: Metadata = {
  title: "Remove assign admins",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function page({ params }: Props) {
  const sesssion = await auth();
  const token = sesssion?.user.accessToken as string;
  const id = (await params).id;

  const url = `/api/websites/admin?websiteId=${id}`;

  const { data, error } = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return (
      <div className="flex justify-center text-center mx-auto my-5">
        <p>{error}</p>
      </div>
    );
  }

  const assignedAdmin = data.filter((admin: any) => admin.assigned);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <RemoveAssignedAdmins admins={assignedAdmin} />
    </div>
  );
}

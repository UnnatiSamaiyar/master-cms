import { auth } from "@/auth";
import ChangeName from "@/components/settings/change-name";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function page() {
  const session = await auth();
  if (!session) {
    throw new Error("You are unauthorized.");
  }
  const token = session.user.accessToken as string;
  const { data, error } = await apiClient.get(
    `/api/admins/${session.user.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (error) {
    return <div className="text-center">{error}</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Name</CardTitle>
      </CardHeader>
      <CardContent>
        <ChangeName data={data} />
      </CardContent>
    </Card>
  );
}

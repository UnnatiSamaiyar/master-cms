import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import ChangePassword from "@/components/settings/change-password";

export const metadata: Metadata = {
  title: "Change Password",
};

export default function page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Your Password</CardTitle>
      </CardHeader>
      <CardContent>
        <ChangePassword />
      </CardContent>
    </Card>
  );
}

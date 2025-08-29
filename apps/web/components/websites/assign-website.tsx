"use client";

import { Fragment, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Check, Users } from "lucide-react";
import { cn, shortName } from "@/lib/utils";
import { format } from "date-fns";
import { useParams, useSearchParams } from "next/navigation";
import SubmitButton from "../submit-button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient";
import { toastOptions } from "@/lib/constant";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  assigned: boolean;
}

interface Props {
  admins: Admin[];
}

export default function AssignWebsite({ admins }: Props) {
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const searchParmas = useSearchParams();
  const { id } = useParams();

  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId],
    );
  };

  const availableAdmins = admins.filter((admin) => !admin.assigned);

  const assignHandler = () => {
    if (!selectedAdmins.length)
      return toast.info("Please select atleast one admin.");
    startTransition(async () => {
      const { message, error } = await apiClient.post(
        "/api/websites/admin/assign",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ websiteId: id, adminIds: selectedAdmins }),
        },
      );
      if (error) {
        toast.error(error, toastOptions);
      } else {
        toast.success(message, toastOptions);
        setSelectedAdmins([]);
      }
    });
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">
          Select admins to manage the "{searchParmas.get("name")}" website.
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-sm">
            {selectedAdmins.length} selected / {availableAdmins.length}{" "}
            available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => {
          const isSelected = selectedAdmins.includes(admin.id);

          return (
            <Card
              key={admin.id}
              className={cn(
                "relative transition-all duration-200",
                admin.assigned && "opacity-50 cursor-not-allowed",
                !admin.assigned &&
                  "cursor-pointer hover:shadow-lg hover:scale-105",
                isSelected && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => !admin.assigned && handleSelectAdmin(admin.id)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className={cn(
                        "text-primary uppercase",
                        isSelected ? "bg-primary/20" : "bg-primary/10",
                      )}
                    >
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
                    {admin.assigned && (
                      <Badge variant="outline">Assigned</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {format(new Date(admin.createdAt), "PPP")}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <SubmitButton
        isPending={isPending}
        className="w-fit"
        onClick={assignHandler}
        disabled={!selectedAdmins.length}
      >
        Assign
      </SubmitButton>
    </Fragment>
  );
}

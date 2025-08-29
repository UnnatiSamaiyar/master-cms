import RecentAdmins from "@/components/dashboard/recent-admin";
import RecentArticles from "@/components/dashboard/recent-articles";
import TotalAdmins from "@/components/dashboard/total-admins";
import TotalArticles from "@/components/dashboard/total-articles";
import Totalwebsite from "@/components/dashboard/total-website";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        <Totalwebsite />
        <TotalAdmins />
        <TotalArticles />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <RecentAdmins />
        <RecentArticles />
      </div>
    </div>
  );
}

"use client";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DashboardBreadCrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          return !isLast ? (
            <React.Fragment key={`fragment-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbLink href={href} className="capitalize">
                  {decodeURIComponent(segment)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator key={`separator-${index}`} />
            </React.Fragment>
          ) : (
            <BreadcrumbItem key={`page-${index}`}>
              <BreadcrumbPage className="capitalize">
                {decodeURIComponent(segment)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DashboardBreadCrumb;

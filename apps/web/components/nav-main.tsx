"use client";

import { ChevronRight, LayoutDashboard, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import useUIStore from "@/store/uiStore";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
      action?: string;
    }[];
  }[];
}) {
  const {
    adminAddSheetOpen,
    adminAddSheetChange,
    articleAddSheetOpen,
    articleAddSheetChange,
  } = useUIStore();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleClick = (item: {
    url?: string;
    action?: string;
    title: string;
  }) => {
    if (item.action) {
      switch (item.action) {
        case "add-article":
          articleAddSheetChange(!articleAddSheetOpen);
          break;
        case "add-admin":
          adminAddSheetChange(!adminAddSheetOpen);
          break;
        default:
          console.log(`Unknown action: ${item.action}`);
      }
    }
  };

  const isExactMatch = (url: string) => pathname === url;
  const isParentActive = (url: string) => pathname.startsWith(url);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Master Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={isExactMatch("/dashboard")}>
            <LayoutDashboard /> <Link href="/dashboard">Dashboard</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {items.map((item) => {
          const isCurrentParentActive = isParentActive(item.url);
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isCurrentParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isCurrentParentActive}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isExactMatch(subItem.url)}
                        >
                          <Link
                            href={subItem.url}
                            onClick={() => handleClick(subItem)}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

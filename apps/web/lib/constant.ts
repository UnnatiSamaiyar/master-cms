import { ExternalToast } from "sonner";
import {
  Bot,
  Frame,
  ImagePlus,
  Mail,
  Map,
  PieChart,
  SquareTerminal,
  User,
} from "lucide-react";
import { adminRole } from "@/types/admin";

export const getSideBar = (role: adminRole) => {
  switch (role) {
    case "admin":
      return adminSidebar;
    case "subadmin":
      return subadminSidebar;
    case "content writer":
      return contentwriterSidebar;
    default:
      return adminSidebar;
  }
};

export const subadminSidebar = {
  navMain: [
    {
      title: "Websites",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "View Websites",
          url: "/dashboard/websites",
        },
      ],
    },
    {
      title: "Articles",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "View Articles",
          url: "/dashboard/articles",
        },
        {
          title: "Add Article",
          action: "add-article",
          url: "#",
        },
      ],
    },
  ],
  websites: [
    {
      name: "Website Category",
      url: "/dashboard/categories",
      icon: Frame,
    },
    {
      name: "Website Section",
      url: "/dashboard/sections",
      icon: PieChart,
    },
    {
      name: "Website Article",
      url: "/dashboard/website-article",
      icon: Map,
    },
    {
      name: "Website Ads",
      url: "/dashboard/website-ads",
      icon: ImagePlus,
    },
    {
      name: "Website Newsletter",
      url: "/dashboard/website-newsletter",
      icon: Mail,
    },
  ],
};

export const contentwriterSidebar = {
  navMain: [
    {
      title: "Articles",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "View Articles",
          url: "/dashboard/articles",
        },
        {
          title: "Add Article",
          action: "add-article",
          url: "#",
        },
      ],
    },
  ],
};

export const adminSidebar = {
  navMain: [
    {
      title: "Websites",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "View Websites",
          url: "/dashboard/websites",
        },
        {
          title: "Add Websites",
          url: "/dashboard/websites/add",
        },
      ],
    },
    {
      title: "Articles",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "View Articles",
          url: "/dashboard/articles",
        },
        {
          title: "Add Article",
          action: "add-article",
          url: "#",
        },
      ],
    },
    {
      title: "Admins",
      url: "#",
      icon: User,
      items: [
        {
          title: "View Admins",
          url: "/dashboard/admins",
        },
        {
          title: "Add Admin",
          url: "#",
          action: "add-admin",
        },
      ],
    },
  ],
  websites: [
    {
      name: "Website Category",
      url: "/dashboard/categories",
      icon: Frame,
    },
    {
      name: "Website Section",
      url: "/dashboard/sections",
      icon: PieChart,
    },
    {
      name: "Website Article",
      url: "/dashboard/website-article",
      icon: Map,
    },
    {
      name: "Website Ads",
      url: "/dashboard/website-ads",
      icon: ImagePlus,
    },
    {
      name: "Website Newsletter",
      url: "/dashboard/website-newsletter",
      icon: Mail,
    },
  ],
};

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:6003";

export const toastOptions: ExternalToast = {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
};

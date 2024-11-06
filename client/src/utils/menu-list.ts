import {
  Settings,
  Bookmark,
  LayoutGrid,
  UploadCloud
} from "lucide-react";


type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Home",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/upload",
          label: "Upload",
          active: pathname.includes("/categories"),
          icon: UploadCloud,
        },
      ] 
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
        }
      ]
    }
  ];
}
import React from "react";
import PlaceholderContent from "@/components/demo/placeholder-content";
import { ContentLayout } from "@/components/home-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Footer } from "@/components/home-panel/footer";
import { Sidebar } from "@/components/home-panel/sidebar";
import { useStore } from "zustand";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { cn } from '../../../utils/utils';
import { Navbar } from "@/components/home-panel/navbar";
import Layout from "@/components/home-panel/layout";
import ProfilePage from "@/components/demo/ProfilePage";
export default function AccountPage() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;
  return (
    
    <Layout>
      
    <ContentLayout title="Account">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/">Home</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/dashboard">Dashboard</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    <ProfilePage/>
      
    </ContentLayout>
    
    </Layout>
   



  );
}

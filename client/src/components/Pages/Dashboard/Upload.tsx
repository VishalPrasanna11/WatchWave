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
import Layout from "@/components/home-panel/layout";
import VideoUploadPage from "@/components/demo/UploadPage";

export default function Upload() {
  return (
    <Layout>
    <ContentLayout title="Upload Video">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/">Home</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Upload</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <VideoUploadPage />
    </ContentLayout>
    </Layout>
  );
}

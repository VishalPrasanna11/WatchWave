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
import WatchPage from "@/components/demo/WatchPage";
import { useParams } from "react-router-dom";

export default function UsersPage() {
  const { videoId } = useParams<{ videoId: string }>();
  console.log(videoId);
  
  return (
    <Layout>
      <ContentLayout title="Watch Video">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="/">Home</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Watch</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Pass videoId as a prop */}
        <WatchPage videoId={videoId ?? ""} />
      </ContentLayout>
    </Layout>
  );
}

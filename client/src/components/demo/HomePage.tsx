import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useGetAllVideos } from "@/API/VideoAPI";

const HomePage = () => {
  const navigate = useNavigate();
  const { videos: videos, isLoading, error } = useGetAllVideos();
  console.log(videos);
  const handleVideoClick = React.useCallback((videoId: string) => {
    navigate(`/watch/${videoId}`);
  }, [navigate]);

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>Error fetching videos: {error.message}</div>;
  }
  console.log(videos);
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap gap-4">
        {videos?.map((video: any) => (
          <Card 
            key={video.id} 
            className="w-full sm:w-[300px] cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => handleVideoClick(video.id)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={video.thumbnailUrl || "/api/placeholder/320/180"} // Fallback thumbnail
                  alt={video.title}
                  className="w-full aspect-video object-cover rounded-t-lg"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-xs rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{video.publisherName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <span>{video.views}</span>
                  <span className="mx-2">•</span>
                  {/* <Clock className="w-4 h-4 mr-1" /> */}
                  <span>{video.timestamp}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

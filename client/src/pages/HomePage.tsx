import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const videos = [
    {
      id: 1,
      thumbnail: "/api/placeholder/320/180",
      title: "Understanding React Basics",
      channel: "React Masters",
      views: "102K",
      timestamp: "3 days ago",
      duration: "41:59"
    },
    {
      id: 2,
      thumbnail: "/api/placeholder/320/180",
      title: "Building Modern UIs",
      channel: "UI/UX Hub",
      views: "225K",
      timestamp: "17 hours ago",
      duration: "10:07"
    },
    {
      id: 3,
      thumbnail: "/api/placeholder/320/180",
      title: "Advanced Component Patterns",
      channel: "Code Masters",
      views: "78K",
      timestamp: "1 day ago",
      duration: "21:20"
    }
  ];
  const navigate = useNavigate();

  const handleVideoClick = React.useCallback((videoId: number) => {
    navigate(`/watch/`);
  }, [navigate]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap gap-4">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className="w-full sm:w-[300px] cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => handleVideoClick(video.id)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={video.thumbnail}
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
                  <span>{video.channel}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <span>{video.views}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
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
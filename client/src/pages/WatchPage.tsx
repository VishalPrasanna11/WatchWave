import { useGetAllVideos } from '@/API/VideoAPI';
import Player from '@/components/Player';
const WatchPage = () => {
  // Use the custom hook to get video data
  const { videos, isLoading, isError, error } = useGetAllVideos();

  // Display loading message or error message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  // Handle case where videos is empty or undefined
  if (!videos || videos.length === 0) {
    return <div>No videos available</div>;
  }

  // Assuming the first video has the `videoUrl`
  const videoUrl = videos[0]?.videoUrl;

  return (
    <div style={{ textAlign: 'center' }}>
      {videoUrl ? (
        <Player url={videoUrl} />
      ) : (
        <div>No video URL available</div>
      )}
    </div>
  );
};

export default WatchPage;

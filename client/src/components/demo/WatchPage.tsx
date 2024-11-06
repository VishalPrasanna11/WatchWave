import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetAllVideos, useGetVideoById } from '../../API/VideoAPI';
import Player from '../../components/Player';

const WatchPage = ({ videoId }: { videoId: string }) => {
  // Get the `id` from the route parameters
  
  console.log(videoId);
  // Use the custom hook to get video data
  const { video:videoUrl, isLoading, isError, error } = useGetVideoById(videoId);
  
  // Display loading or error messages
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const url = videoUrl?.videoUrl;

  console.log(videoUrl?.videoUrl);
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  //Handle case where videos array is empty or undefined
  if (videoUrl === undefined) {
    return <div>No videos available</div>;
  }

  // Find the specific video by its `id`
  

  return (
    <div style={{ textAlign: 'center' }}>
      {url? (
        <>
          {/* <h2>Video ID: {video.id}</h2> */}
          {videoUrl!==undefined?(
            <Player url={url} />
          ) : (
            <div>No video URL available</div>
          )}
        </>
      ) : (
        <div>Video not found</div>
      )}
    </div>
  );
};

export default WatchPage;

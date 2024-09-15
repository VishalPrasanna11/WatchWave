import React from 'react';
import { useUploadVideo, useGetAllVideos } from '../API/VideoAPI'; // Consolidated imports
import UploadForm, { VideoFormData } from '../Forms/UploadForm';
import { UseMutationResult } from '@tanstack/react-query';
import { Video, VideoUpload } from '../types';

const VideoUploadPage = () => {
    const {
        mutate: uploadVideo, // Upload mutation function
        isLoading,           // Loading state from the mutation
        isError,             // Error state from the mutation
        error,               // Error details
        isSuccess,           // Success state from the mutation
      } = useUploadVideo() as UseMutationResult<Video, Error, VideoUpload, unknown> & { isLoading: boolean };
    const { videos, isLoading: videosLoading, isError: videosError } = useGetAllVideos();

  const handleUpload = (data: VideoFormData) => {
    uploadVideo({
      title: data.title,
      videoFile: data.videoFile,
      description: data.description || '', // Provide a default value for description
      metatags: data.metatags || [],
    });
  };

  return (
    <div>
    
      
      {/* Display uploading state */}
      {isLoading && <p>Uploading...</p>}
      
      {/* Display upload error */}
      {isError && <p>Error: {error?.message}</p>}
      
      {/* Display success message */}
      {isSuccess && <p>Video uploaded successfully!</p>}

      {/* List videos */}
      {videosLoading ? (
        <p>Loading videos...</p>
      ) : videosError ? (
        <p>Error loading videos: {videosError}</p>
      ) : (
        <div>
        
          <ul>
            {videos?.map((video) => (
              <li key={video.id}>{video.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload form */}
      <UploadForm onSave={handleUpload} isLoading={isLoading} />
    </div>
  );
};

export default VideoUploadPage;

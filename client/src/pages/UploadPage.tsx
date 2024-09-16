import React from 'react';
import { useUploadVideo, useGetAllVideos } from '../API/VideoAPI';
import UploadForm, { VideoFormData } from '../Forms/UploadForm';
import { UseMutationResult } from '@tanstack/react-query';
import { Video, VideoUpload } from '../types';
import { useNavigate } from 'react-router-dom';

const VideoUploadPage = () => {
  const navigate = useNavigate();

  const {
    mutate: uploadVideo,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useUploadVideo() as UseMutationResult<Video, Error, VideoUpload, unknown> & { isLoading: boolean };

  const handleUpload = (data: VideoFormData) => {
    uploadVideo(
      {
        title: data.title,
        video: data.video,
        description: data.description || '', // Provide a default value for description
        metatags: data.metatags || [],
      },
      {
        onSuccess: () => {
          navigate('/watch'); // Redirect to watch page on successful upload
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      }
    );
  };

  return (
    <div>
      <UploadForm onSave={handleUpload} isLoading={isLoading} />
    </div>
  );
};

export default VideoUploadPage;

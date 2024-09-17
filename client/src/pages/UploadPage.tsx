import React from 'react';
import { useUploadVideo } from '../API/VideoAPI';
import UploadForm, { VideoFormData } from '../Forms/UploadForm';
import { UseMutationResult } from '@tanstack/react-query';
import { Video, VideoUpload } from '../types';
import { useNavigate } from 'react-router-dom';

const VideoUploadPage = () => {
  const navigate = useNavigate();

  // Upload video mutation hook
  const {
    mutate: uploadVideo,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useUploadVideo() as UseMutationResult<Video, Error, VideoUpload, unknown> & { isLoading: boolean };

  // Handle form submission and video upload
  const handleUpload = (data: VideoFormData) => {
    uploadVideo(
      {
        title: data.title,
        video: data.video,
        description: data.description || '', // Default description to empty string
        metatags: data.metatags || [], // Default metatags to empty array
      },
      {
        onSuccess: () => {
          // Redirect to the watch page after successful upload
          navigate('/watch');
        },
        onError: (error) => {
          // Log or handle error if the upload fails
          console.error('Upload failed:', error);
        },
      }
    );
  };

  return (
    <div className="p-4">
      {/* Render the upload form and pass the loading state */}
      <UploadForm onSave={handleUpload} isLoading={isLoading} />
      {isError && (
        <p className="text-red-500">
          An error occurred: {error?.message || 'Something went wrong during upload.'}
        </p>
      )}
      {isSuccess && <p className="text-green-500">Video uploaded successfully!</p>}
    </div>
  );
};

export default VideoUploadPage;

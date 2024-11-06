import { useMutation, useQuery } from "@tanstack/react-query";
import { Video, VideoUpload } from "../types";
import { toast } from "sonner";
import { useState } from "react";

const BASE_URL = 'http://localhost:8081/api/videos';

const uploadChunk = async (
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  videoId: string,
  uploadId: string
): Promise<{ ETag: string }> => {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('totalChunks', totalChunks.toString());
  formData.append('videoId', videoId);
  formData.append('uploadId', uploadId);

  const response = await fetch(`${BASE_URL}/upload-chunk`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Chunk upload failed! Status: ${response.status}`);
  }

  return await response.json();
};

export const uploadVideoInChunks = async (videoData: VideoUpload): Promise<Video> => {
  const CHUNK_SIZE = 100 * 1024 * 1024;
  const file = videoData.video;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  try {
    // Step 1: Initialize the upload with additional fields
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('description', videoData.description || '');
    formData.append('publisher', videoData.publisher);
    formData.append('thumbnail', videoData.thumbnail); 
    formData.append('duration', videoData.duration.toString());  // Adding thumbnail image
    console.log("This is an form data",formData.get('title'));
    console.log("This is an form data",formData.get('description'));
    console.log("This is an form data",formData.get('publisher'));
    console.log("This is an form data",formData.get('thumbnail'));
    // Adding duration

    const initResponse = await fetch(`${BASE_URL}/initialize-multipart`, {
      method: 'POST',
      body: formData,
     
    });

    if (!initResponse.ok) {
      throw new Error(`Initialization failed: ${initResponse.statusText}`);
    }

    const { videoId, uploadId } = await initResponse.json();
    console.log(`Initialized upload with videoId: ${videoId}, uploadId: ${uploadId}`);

    // Step 2: Split the file into chunks and upload them concurrently
    const uploadPromises = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      uploadPromises.push(uploadChunk(chunk, i + 1, totalChunks, videoId, uploadId));
    }
    const uploadResults = await Promise.all(uploadPromises);

    // Step 3: Notify the backend that all chunks have been uploaded
    const parts = uploadResults.map((result, index) => ({
      PartNumber: index + 1,
      ETag: result.ETag,
    }));

    const finalizeResponse = await fetch(`${BASE_URL}/complete-multipart`, {
      method: 'POST',
      body: JSON.stringify({ videoId, uploadId, parts }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!finalizeResponse.ok) {
      throw new Error(`Finalization failed: ${finalizeResponse.statusText}`);
    }

    // Return the finalized video information
    const video: Video = await finalizeResponse.json();
    return video;
  } catch (error) {
    throw new Error(`Video upload error: ${(error as Error).message}`);
  }
};


// UseMutation hook for uploading video in chunks
export const useUploadVideo = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation<Video, Error, VideoUpload>({
    mutationFn: async (videoData) => {
      setIsLoading(true); // Set loading state to true when upload starts
      const result = await uploadVideoInChunks(videoData);
      setIsLoading(false); // Set loading state to false when upload completes
      return result;
    },
    onSuccess: () => {
      toast.success("Video and thumbnail uploaded successfully!");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(`Unable to upload video: ${error.message}`);
      setIsLoading(false);
    },
  });

  return { ...mutation, isLoading };
};



// Define the API call for fetching all videos
export const getAllVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${BASE_URL}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('HTTP error! Status:', response.status);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: Video[] = await response.json();
    return data; // Assuming data contains an array of videos
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Define the hook using useQuery
export const useGetAllVideos = () => {
  const { data: videos, isLoading, isError, error } = useQuery<Video[], Error>({
    queryKey: ['fetchAllVideos'], // Query key must be an array
    queryFn: getAllVideos,       // Query function
  });

  return { videos, isLoading, isError, error };
};

// Define the API function to get a video by ID
export const getVideoById = async (videoId: string): Promise<Video> => {
  try {
    const response = await fetch(`${BASE_URL}/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('HTTP error! Status:', response.status);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: Video = await response.json();
    return data; // Assuming data contains the video object
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

// Define the hook using useQuery
export const useGetVideoById = (videoId: string) => {
  const { data: video, isLoading, isError, error } = useQuery<Video, Error>({
    queryKey: ['fetchVideoById', videoId], // Query key must be an array, include videoId
    queryFn: () => getVideoById(videoId),   // Query function with videoId
    enabled: !!videoId, // Enable query only if videoId is defined
  });

  return { video, isLoading, isError, error };
};

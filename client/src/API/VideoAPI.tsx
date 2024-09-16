import {useQuery ,useMutation} from "@tanstack/react-query";
import { Video } from "../types";
import {toast} from "sonner";
import { VideoUpload} from "../types";
const BASE_URL = 'http://localhost:3000/api/videos'; // Adjust if necessary

// Define the API call for uploading a video
export const uploadVideo = async (videoData: VideoUpload): Promise<Video> => {
  try {
    const formData = new FormData();
    formData.append('title', videoData.title);
    formData.append('video', videoData.video); // Assuming videoFile is a File object
    formData.append('description', videoData.description || '');

    if (videoData.metatags) {
      videoData.metatags.forEach(tag => formData.append('metatags[]', tag));
    }
    console.log('This is from formData ===============>',formData.getAll('title'));
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: Video = await response.json();
    return data; // Assuming the response contains the uploaded video data
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const useUploadVideo = () => {
  // Initialize mutation
  const mutation = useMutation<Video, Error, VideoUpload>({
    mutationFn: uploadVideo,
    onSuccess: () => {
      toast.success("Video uploaded successfully!");
    },
    onError: () => {
      toast.error("Unable to upload video.");
    },
  });

  // Return mutation along with its state for convenience
  return mutation;
};



// Define the API call
export const getAllVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${BASE_URL}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
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


import {useQuery } from "@tanstack/react-query";
import { Video } from "../types";
const BASE_URL = 'http://localhost:3000/api/videos'; // Adjust if necessary



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


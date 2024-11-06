import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";


const BASE_URL = 'http://localhost:8081/v1/'; // Adjust as necessary

import logger from '../config/logger'
import { log } from "console";
// Define the types for User
interface User {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}

interface UserCreateUpdate {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}

// API call for creating a user
const createUser = async (userData: UserCreateUpdate): Promise<User> => {
logger.info('Creating user')
logger.info(userData.first_name)
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    logger.error(`User creation failed! Status: ${response.status}`);
    throw new Error(`User creation failed! Status: ${response.status}`);
  }

  return await response.json();
};

// API call for updating a user
const updateUser = async (userId: string, userData: UserCreateUpdate): Promise<User> => {
  const response = await fetch(`${BASE_URL}/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`User update failed! Status: ${response.status}`);
  }

  return await response.json();
};

// useMutation hook for user creation
export const useCreateUser = () => {
  return useMutation<User, Error, UserCreateUpdate>({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created successfully!");
    },
    onError: (error) => {
      toast.error(`User creation failed: ${error.message}`);
    },
  });
};

// useMutation hook for user update
export const useUpdateUser = (userId: string) => {
  return useMutation<User, Error, UserCreateUpdate>({
    mutationFn: (userData) => updateUser(userId, userData),
    onSuccess: () => {
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      toast.error(`User update failed: ${error.message}`);
    },
  });
};

// API call for fetching getusers
export const getUser = async (basicAuth: string) => {
    logger.info('Fetching user from getUser')
    console.log(basicAuth)
    const decodedString = atob(basicAuth);
    console.log(decodedString); 
    try {
      const response = await fetch(`${BASE_URL}/user/self`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
        },
      });
  
      if (!response.ok) {
        const text = await response.text(); 
        console.log('text')
        console.log(text)

        throw new Error('Authentication failed');
      }
      logger.info('User fetched')
      const userData = await response.json();
      logger.info('===========')
      logger.info(userData);
      return userData;
      return response.json(); // Assuming the response is JSON.
    } catch (error) {
        console.log(error)
        logger.error('Error fetching user:');
      throw error; // Let the calling function handle the error.
    }
  };
// useQuery hook for fetching get user;
export const useGetUser = (basicAuth: string) => {
    logger.info('Fetching user call in useGetUser')
    const {
      data: user,
      isLoading,
      isError,
      error,
    } = useQuery<User, Error>({
      queryKey: ['fetchUser', basicAuth], // Query key with dependency
      queryFn: () => getUser(basicAuth), // Inline query function
      enabled: !!basicAuth, // Only fetch if `basicAuth` is available
    });
    //logger.info(`User state details: ${JSON.stringify({ user, isLoading, isError, error })}`);
    //logger.info(`user: ${user}`)

    return { user, isLoading, isError, error };
  };

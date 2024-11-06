import { Request, Response } from 'express';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand,GetObjectCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import Video from '../models/Video';
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
import { sendMessage } from '../config/kafka';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


const BASE_URL = 'http://localhost:3000/api/videos'; // Adjust if necessary

// Initialize multipart upload
// export const initializeMultipartUpload = async (req: Request, res: Response) => {
 
//   try {
//     const { title, description, metatags } = req.body;

//     if (!title || !description) {
//       return res.status(400).json({ message: 'Title and description are required.' });
//     }
  
//     const videoId = uuidv4();
//     const multipartUpload = await s3.send(new CreateMultipartUploadCommand({
//       Bucket: process.env.AWS_Bucket_Name!,
//       Key: `videos/${videoId}`,
//     }));

//     const uploadId = multipartUpload.UploadId;

//     if (!uploadId) {
//       throw new Error('Failed to get UploadId from S3');
//     }

//     // TODO: Store uploadId, videoId, and video metadata in your database
//     const newVideo = await Video.create({
//       videoId,
//       title,
//       description,
//       metatags,
//       uploadId,
//       status: 'uploading',
//       videoUrl: '',
//     });

//     res.status(200).json({ videoId, uploadId });
//   } catch (error) {
//     console.error('Error initializing multipart upload:', error);
//     res.status(500).json({ message: 'Failed to initialize upload.', error: (error as Error).message });
//   }
// };

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};
export const initializeMultipartUpload = async (req: Request, res: Response) => {
  try {
    const { title, description, publisher, duration} = req.body;
    const imageUrl = await uploadImage(req.file as Express.Multer.File); // Assuming the image is uploaded as a single file with `req.file`
    console.log(req.body);
    // Validate required fields
    if (!title || !description || !publisher || !duration ) {
      return res.status(400).json({ message: 'Title, description, first name, last name, publisher name, and duration are required.' });
    }

    // Construct publisher name if not already provided
    //const fullPublisherName = publisherName || `${firstName} ${lastName}`;

    // Upload image to Cloudinary if thumbnail is provided


    console.log("==================================");
    let thumbnailUrl = imageUrl;
    // if (thumbnail) {
    //   const cloudinaryResponse = await cloudinary.uploader.upload(thumbnail.path, {
    //     resource_type: 'image',
    //   });
    //   thumbnailUrl = cloudinaryResponse.secure_url;
    //   console.log(thumbnailUrl);
    // }

    // Initialize S3 multipart upload
    const videoId = uuidv4();
    const multipartUpload = await s3.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_Bucket_Name!,
        Key: `videos/${videoId}`,
      })
    );

    const uploadId = multipartUpload.UploadId;

    if (!uploadId) {
      throw new Error('Failed to get UploadId from S3');
    }

    // Store video metadata in the database, including Cloudinary image URL and publisher name
    const newVideo = await Video.create({
      videoId,
      title,
      description,
      uploadId,
      status: 'uploading',
      videoUrl: '',
      thumbnailUrl: thumbnailUrl, // Store Cloudinary image URL
      publisherName: publisher, // Store full publisher name
      duration,      // Store video duration
    });

    res.status(200).json({ videoId, uploadId });
  } catch (error) {
    console.error('Error initializing multipart upload:', error);
    res.status(500).json({
      message: 'Failed to initialize upload.',
      error: (error as Error).message,
    });
  }
};
// Upload chunk
export const uploadChunk = async (req: Request, res: Response) => {
  try {
    const { chunkIndex, videoId, uploadId } = req.body;
    const chunk = req.file?.buffer;

    if (!chunk) {
      return res.status(400).json({ message: 'No chunk data received.' });
    }

    // Validate chunk size
    const maxChunkSize = 100 * 1024 * 1024; // 5MB
    if (chunk.length > maxChunkSize) {
      return res.status(400).json({ message: 'Chunk size exceeds maximum allowed size.' });
    }

    if (!videoId || !uploadId) {
      return res.status(400).json({ message: 'Missing videoId or uploadId.' });
    }

    const partNumber = Number(chunkIndex);
    if (isNaN(partNumber) || partNumber < 1) {
      return res.status(400).json({ message: 'Invalid chunk index.' });
    }

    const partUpload = await s3.send(new UploadPartCommand({
      Bucket: process.env.AWS_Bucket_Name!,
      Key: `videos/${videoId}`,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: chunk,
    }));

    if (!partUpload.ETag) {
      throw new Error('Failed to get ETag from S3 upload');
    }

    // TODO: Update upload progress in your database
    // await Video.findOneAndUpdate({ videoId }, { $push: { uploadedParts: { partNumber, ETag: partUpload.ETag } } });
    await Video.update(
      { status: 'uploading' }, // Update status or other fields if needed
      { where: { videoId } }
    );

    res.status(200).json({ message: 'Chunk uploaded successfully.', ETag: partUpload.ETag });
  } catch (error) {
    console.error('Error uploading chunk:', error);
    res.status(500).json({ message: 'Failed to upload chunk.', error: (error as Error).message });
  }
};

// Complete multipart upload


export const completeMultipartUpload = async (req: Request, res: Response) => {
  try {
    const { videoId, uploadId, parts } = req.body;

    // Check for required fields
    if (!videoId || !uploadId) {
      return res.status(400).json({ message: 'Missing videoId or uploadId.' });
    }

    // Validate parts array
    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ message: 'Parts array is empty or not an array.' });
    }

    // Validate structure of each part
    if (!parts.every(part => 
        typeof part.PartNumber === 'number' && 
        typeof part.ETag === 'string' && 
        part.ETag.length > 0
    )) {
      return res.status(400).json({ message: 'Invalid parts array. Each part must have a PartNumber and ETag.' });
    }

    // Ensure parts are in ascending order
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

    // Check for missing parts
    const expectedPartCount = sortedParts[sortedParts.length - 1].PartNumber;
    if (sortedParts.length !== expectedPartCount) {
      return res.status(400).json({ message: 'Missing parts in the upload.' });
    }

    // Log parts for debugging
  
    // Complete the multipart upload
    const result = await s3.send(new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_Bucket_Name!,
      Key: `videos/${videoId}`,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    }));

    const videoUrl = `https://${process.env.AWS_Bucket_Name!}.s3.${process.env.AWS_REGION!}.amazonaws.com/videos/${videoId}`;

    // Update video status and URL in your database
    await Video.update(
      { status: 'completed', uploadedAt: new Date(), videoUrl: videoUrl }, // Adjust fields as necessary
      { where: { videoId } }
    );

    // Send a Kafka message indicating upload completion
    const message = JSON.stringify({ status: 'completed', videoId, videoUrl });
    sendMessage('watchwave-video-upload', message); // Adjust the topic name as needed

    res.status(200).json({ 
      message: 'Upload completed successfully.',
      location: result.Location,
      key: result.Key,
      videoUrl
    });
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to complete upload.', error: errorMessage });
  }
};


// Abort multipart upload (optional)
export const abortMultipartUpload = async (req: Request, res: Response) => {
  try {
    const { videoId, uploadId } = req.body;

    if (!videoId || !uploadId) {
      return res.status(400).json({ message: 'Missing videoId or uploadId.' });
    }

    await s3.send(new AbortMultipartUploadCommand({
      Bucket: process.env.AWS_Bucket_Name!,
      Key: `videos/${videoId}`,
      UploadId: uploadId,
    }));

    // TODO: Update video status in your database
    // await Video.findOneAndUpdate({ videoId }, { status: 'aborted' });
    await Video.update(
      { status: 'aborted' },
      { where: { videoId } }
    );

    res.status(200).json({ message: 'Upload aborted successfully.' });
  } catch (error) {
    console.error('Error aborting upload:', error);
    res.status(500).json({ message: 'Failed to abort upload.', error: (error as Error).message });
  }
};

// Fetch all videos
const URL_EXPIRATION_TIME = 60 * 60;  // 1 hour

// Function to get all videos
export const getAllVideos = async (req: Request, res: Response) => {
  try {
    // Fetch all videos from the database
    const videos = await Video.findAll();
   
    // Generate pre-signed URLs for each video
    const videosWithSignedUrls = await Promise.all(videos.map(async (video) => {
      // Generate a pre-signed URL for the video
      const url = video.videoUrl;
      const key = url.split('com/')[1];
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_Bucket_Name!,
        Key: key  // Extract the filename from the URL
      });

      // Generate the pre-signed URL
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: URL_EXPIRATION_TIME });


      return {
        ...video.toJSON(),  // Return all other video fields
        videoUrl: signedUrl  // Replace videoUrl with the pre-signed URL
      };
    }));

    // Send the response with the videos and their signed URLs
    res.status(200).json(videosWithSignedUrls);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos', error });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  const { id } = req.params; // Get the video ID from request parameters
  try {
    // Fetch the video from the database by ID
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }



    // Generate a pre-signed URL for the video
    const url = video.videoUrl;
    const key = url.split('com/')[1]; // Extract the key from the URL


    const command = new GetObjectCommand({
      Bucket: process.env.AWS_Bucket_Name!,
      Key: key  // Use the extracted key
    });

    // Generate the pre-signed URL
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: URL_EXPIRATION_TIME });

    // Return the video details along with the signed URL
    res.status(200).json({
      videoUrl: signedUrl 
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Failed to fetch video', error });
  }
};
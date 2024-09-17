import { Request, Response } from 'express';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand,GetObjectCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import Video from '../models/Video';
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
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
export const initializeMultipartUpload = async (req: Request, res: Response) => {
  try {
    const { title, description, metatags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const videoId = uuidv4();
    const multipartUpload = await s3.send(new CreateMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `videos/${videoId}`,
    }));

    const uploadId = multipartUpload.UploadId;

    if (!uploadId) {
      throw new Error('Failed to get UploadId from S3');
    }

    // TODO: Store uploadId, videoId, and video metadata in your database
    const newVideo = await Video.create({
      videoId,
      title,
      description,
      metatags,
      uploadId,
      status: 'uploading',
      videoUrl: '',
    });

    res.status(200).json({ videoId, uploadId });
  } catch (error) {
    console.error('Error initializing multipart upload:', error);
    res.status(500).json({ message: 'Failed to initialize upload.', error: (error as Error).message });
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
      Bucket: process.env.S3_BUCKET_NAME!,
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
    console.log('Completing multipart upload with parts:', JSON.stringify(sortedParts));

    // Complete the multipart upload
    const result = await s3.send(new CompleteMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `videos/${videoId}`,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    }));
    const videoUrl = `https://${process.env.S3_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/videos/${videoId}`;

    // Update video status and URL in your database
    await Video.update(
      { status: 'completed', uploadedAt: new Date(), videoUrl: videoUrl }, // Adjust fields as necessary
      { where: { videoId } }
    );
  
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
      Bucket: process.env.S3_BUCKET_NAME!,
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
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `videos/${video.videoUrl.split('/').pop()}`,  // Extract the filename from the URL
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
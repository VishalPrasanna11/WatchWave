import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand ,GetObjectCommand} from '@aws-sdk/client-s3';
import Video from '../models/Video';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to handle video upload
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { title, description, metatags } = req.body;
    console.log('Incoming body:', req.body);
    console.log('Uploaded file:', req.file);
    const filePath = path.join(__dirname, '../../uploads', req.file!.filename);

    // Read file content
    const fileContent = fs.readFileSync(filePath);

    // Upload file to S3 (without ACL)
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `videos/${req.file!.filename}`,
      Body: fileContent,
    }));

    // S3 file URL
    const videoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${req.file!.filename}`;

    // Save video metadata in your database
    const video = await Video.create({
      title,
      description,
      metatags: metatags || [],
      videoUrl,
    });

    // Delete local file after upload to S3
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Video uploaded successfully!',
      video,
    });
  } catch (error) {
    res.status(500).json({ message: 'Video upload failed', error });
  }
};

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
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Video from '../models/Video';

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
    console.log(title, description, metatags);
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
      metatags: metatags.split(','),
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

// Function to get all videos
export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.findAll();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch videos', error });
  }
};

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to download video from S3
async function downloadVideo(bucketName: string, key: string, localFilePath: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  console.log('Inside downloadVideo');

  try {
    const response = await s3Client.send(command);
    
    return new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(localFilePath);
      const bodyStream = response.Body as Readable;
      
      bodyStream.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Download successful!');
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Function to upload file to S3
async function uploadToS3(bucketName: string, key: string, filePath: string) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
    });

    await s3Client.send(command);
    console.log(`Successfully uploaded ${key} to ${bucketName}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Function to transcode video to HLS using FFmpeg
function transcodeToHLS(inputFile: string, outputDir: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputFile)
      .output(`${outputDir}/output.m3u8`)
      .addOption('-hls_time', '10')
      .addOption('-hls_list_size', '0')
      .addOption('-f', 'hls')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

// Main function to handle the full flow
export async function processVideo(s3Url: string, outputBucket: string) {
  const localInputFile = path.join(__dirname, 'input.mp4');
  const outputDir = path.join(__dirname, 'output');
  
  // Extract bucket and key from s3Url
  const bucketName = 'mywatchwave';
  const key = s3Url.split('/').slice(3).join('/');

  try {
    // 1. Download the video from S3
    await downloadVideo(bucketName, key, localInputFile);

    // 2. Transcode the video to HLS
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    await transcodeToHLS(localInputFile, outputDir);

    // 3. Upload HLS files back to S3
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      await uploadToS3(outputBucket, `hls/${file}`, filePath);
    }

    console.log('Transcoding and upload complete!');
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  } finally {
    // Clean up local files
    if (fs.existsSync(localInputFile)) {
      fs.unlinkSync(localInputFile);
    }
    if (fs.existsSync(outputDir)) {
      fs.rmdirSync(outputDir, { recursive: true });
    }
  }
}
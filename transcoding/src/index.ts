import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { processVideo } from './transcoder/singleResoulHLS'; // Adjust the path as needed
import s3ToS3 from './transcoder/s3toS3';
const port = 8081;

const app = express();
app.use(cors({
    origin: '*',
    allowedHeaders: '*'
}));

app.use(express.json());

const s3Url = 's3://mywatchwave/videos/f9194326-1c1e-4820-ba1b-1e1fad0bd85e'; // Replace with actual S3 video URL
const outputBucket = process.env.S3_BUCKET_NAME!; 
// Replace with actual S3 bucket name
// Trigger the video transcoding
async function startVideoTranscoding() {
  try {
    console.log('Starting video processing...');
    // await processVideo(s3Url, outputBucket);
    const masterUrl = await s3ToS3(s3Url);
    console.log(masterUrl);
    console.log('Video processing completed successfully.');
  } catch (error) {
    console.error('Error during video processing:', error);
  }
}


app.get('/', (req, res) => {
    res.send('HHLD YouTube service transcoder');
});

app.get('/transcode', async (req, res) => {
    try {
        await startVideoTranscoding();
        // await convertToHLS(); // Uncomment if needed
        res.send('Transcoding done');
            } catch (error) {
        res.status(500).send('Error during transcoding');
    }
});



// Load environment variables from `.env` file if you're using one

// Example: Video URL and S3 output bucket

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

  import express from 'express';
  import multer from 'multer';
  import { getAllVideos, initializeMultipartUpload, uploadChunk, completeMultipartUpload } from '../controllers/video.Controller';

  const router = express.Router();

  // Multer configuration for local file uploads
  const storage = multer.memoryStorage(); // Use memory storage for chunks
  const upload = multer({ storage });

  // Route to initialize multipart upload
  router.post('/initialize-multipart', initializeMultipartUpload);

  // Route to upload a video chunk
  router.post('/upload-chunk', upload.single('chunk'), uploadChunk);

  // Route to finalize multipart upload
  router.post('/complete-multipart', completeMultipartUpload);

  // Route to get all videos
  router.get('/all', getAllVideos);

  export default router;

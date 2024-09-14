import express from 'express';
import multer from 'multer';
import { uploadVideo, getAllVideos } from '../controllers/video.Controller';

const router = express.Router();

// Multer configuration for local file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save locally before uploading to S3
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to upload video to S3 manually
router.post('/upload', upload.single('video'), uploadVideo);

// Route to get all videos
router.get('/all', getAllVideos);

export default router;

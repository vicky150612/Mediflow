import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { connectDB } from '../db.js';

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

async function Savetodb(filedetailes) {
    const db = await connectDB();
    await db.collection('files').insertOne(filedetailes);
}

// Upload audio file to cloudinary (for prescription audio)
uploadRouter.post('/audio', authMiddleware, upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
    }
    const stream = cloudinary.v2.uploader.upload_stream({ resource_type: 'video', folder: 'Mediflow_Audio' }, (error, result) => {
        if (error) {
            console.log("Error uploading audio", error);
            return res.status(500).json({ message: 'Error uploading audio', cloudinaryError: error.message || error });
        }
        return res.json({ url: result.secure_url, public_id: result.public_id, format: result.format });
    });
    stream.end(req.file.buffer);
});

// Upload file to cloudinary (PDF or Image)
uploadRouter.post('/', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const stream = cloudinary.v2.uploader.upload_stream({ resource_type: 'auto', folder: 'Mediflow_(Zense)' }, (error, result) => {
        if (error) {
            console.log("Error uploading file", error);
            return res.status(500).json({ message: 'Error uploading file', cloudinaryError: error.message || error });
        }
        Savetodb({
            user: req.user.id,
            filename: req.body.filename,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type,
            created_at: new Date(result.created_at),
        });
        return res.json(result);
    });
    stream.end(req.file.buffer);

    console.log("File uploaded successfully");
});

export default uploadRouter;

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { connectDB } from '../db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get doctor detailes
router.get('/detailes/:id', async (req, res) => {
    try {
        const db = await connectDB();
        const doctorId = req.params.id;
        const doctor = await db.collection('users').findOne({ _id: new ObjectId(doctorId), role: 'doctor' });
        if (!doctor) {
            return res.status(200).json({
                success: false,
                message: 'No doctor found'
            });
        }
        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor',
            error: error.message
        });
    }
});

export default router;
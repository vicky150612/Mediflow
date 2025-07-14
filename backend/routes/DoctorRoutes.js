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
            return res.status(404).json({
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

router.put('/receptionist', authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const { receptionistId } = req.body;
        if (!receptionistId) {
            return res.status(400).json({
                success: false,
                message: 'Receptionist ID is required'
            });
        }
        const receptionist = await db.collection('users').findOne({ _id: new ObjectId(receptionistId), role: 'receptionist' });
        if (!receptionist) {
            return res.status(404).json({
                success: false,
                message: 'No receptionist found'
            });
        }
        await db.collection('users').updateOne({ _id: new ObjectId(req.user.id) }, { $set: { receptionist: receptionistId } });
        res.status(200).json({
            success: true,
            message: 'Receptionist changed successfully',
        });
    } catch (error) {
        console.error('Error changing receptionist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change receptionist',
            error: error.message
        });
    }
});


export default router;
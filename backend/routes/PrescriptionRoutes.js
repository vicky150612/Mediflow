import express from 'express';
import { connectDB } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Get prescriptions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.user.id;
        const prescriptions = await db.collection('prescriptions').find({ user: userId }).toArray();
        if (!prescriptions || prescriptions.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No prescriptions found for this user'
            });
        }
        res.status(200).json({
            success: true,
            data: prescriptions,
            count: prescriptions.length
        });
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prescriptions',
            error: error.message
        });
    }
});

// Add prescription by doctor
router.post('/doc', authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const doctorId = req.user.id;
        const { prescription, patientId } = req.body;
        if (!prescription || !patientId) {
            return res.status(400).json({
                success: false,
                message: 'Prescription and patientId are required'
            });
        }
        await db.collection('prescriptions').insertOne({ user: patientId, doctor: doctorId, prescription });
        res.status(200).json({
            success: true,
            message: 'Prescription added successfully',
        });
    } catch (error) {
        console.error('Error adding prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add prescription',
            error: error.message
        });
    }
});

export default router;

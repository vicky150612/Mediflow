import express from 'express';
import { connectDB } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import cloudinary from 'cloudinary';
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



// Update prescription status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const { id } = req.params;
        const { status } = req.body;

        if (!status || (status !== 'Active' && status !== 'Completed')) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }
        const prescription = await db.collection('prescriptions').findOne({ _id: new ObjectId(id) });
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found.' });
        }
        if (prescription.user !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this prescription.' });
        }
        await db.collection('prescriptions').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } }
        );

        res.status(200).json({ success: true, message: 'Prescription status updated successfully.' });
    } catch (error) {
        console.error('Error updating prescription status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prescription status.',
            error: error.message
        });
    }
});

// Delete prescription
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const { id } = req.params;
        const prescription = await db.collection('prescriptions').findOne({ _id: new ObjectId(id) });
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found.' });
        }
        if (prescription.user !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this prescription.' });
        }
        const audioDetails = prescription.audioDetails;
        if (audioDetails) {
            const publicId = audioDetails.public_id;
            const result = await cloudinary.v2.uploader.destroy(publicId, { resource_type: "video", type: "upload" });
        }
        await db.collection('prescriptions').deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ success: true, message: 'Prescription deleted successfully.' });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prescription.',
            error: error.message
        });
    }
});

export default router;

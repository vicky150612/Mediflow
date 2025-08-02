import express from 'express';
import { connectDB } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
import cloudinary from 'cloudinary';
import { Logger } from '../Utils/Logger.js';

const router = express.Router();

// Get files
router.get("/files", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.user.id;
        const files = await db.collection('files').find({ user: userId }).limit(10).toArray();
        if (!files || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files found for this user'
            });
        }
        const response = {
            success: true,
            data: files,
            count: files.length
        };
        Logger(`Fetched ${files.length} files for user: ${req.user.id}`);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch files',
            error: error.message
        });
    }
});

// Delete file
router.delete("/file/:fileId", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.user.id;
        const fileId = req.params.fileId;
        const file = await db.collection('files').findOne({ _id: new ObjectId(fileId), user: userId });
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        const publicId = file.public_id;
        cloudinary.uploader.destroy(publicId, function (error, result) {
            console.log(result, error);
        });
        await db.collection('files').deleteOne({ _id: new ObjectId(fileId), user: userId });
        Logger(`File deleted successfully. File ID: ${fileId}, User ID: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message
        });
    }
});



// Get my access list 
router.get("/accesslist", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.user.id;
        const accessList = await db.collection('accessList').find({ user: userId }).toArray();
        if (!accessList || accessList.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No access list found for this patient'
            });
        }
        Logger(`Fetched access list for user: ${userId}, found ${accessList.length} entries`);
        res.status(200).json({
            success: true,
            data: accessList,
            count: accessList.length
        });
    } catch (error) {
        console.error('Error fetching my access list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch my access list',
            error: error.message
        });
    }
})

// Add doctor to the access list
router.post("/doc", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.user.id;
        const { doctorId } = req.body;
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID is required'
            });
        }
        // Check if the doctor exists in the database
        const doctorObjectId = typeof doctorId === 'string' ? new ObjectId(doctorId) : doctorId;
        const doctorExists = await db.collection('users').findOne({ _id: doctorObjectId });
        if (!doctorExists || doctorExists.role !== 'doctor') {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        const access = await db.collection('accessList').findOne({ user: userId, doctor: doctorId });
        if (access) {
            return res.status(200).json({
                success: false,
                message: 'Doctor already in access list'
            });
        }
        await db.collection('accessList').insertOne({ user: userId, doctor: doctorId });
        Logger(`Doctor ${doctorId} added to access list for user: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Doctor added to access list',
        });
    } catch (error) {
        console.error('Error adding doctor to access list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add doctor to access list',
            error: error.message
        });
    }
})



// Remove doctor from the access list
router.delete("/doc/:doctorId", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const userId = String(req.user.id);
        const doctorId = String(req.params.doctorId);
        console.log(userId, doctorId)

        await db.collection('accessList').deleteOne({ user: userId, doctor: doctorId });
        Logger(`Doctor ${doctorId} removed from access list for user: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Doctor removed from access list',
        });
    } catch (error) {
        console.error('Error removing doctor from access list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove doctor from access list',
            error: error.message
        });
    }
})

// Get details of specific patient
router.get("/details", authMiddleware, async (req, res) => {
    try {
        const db = await connectDB();
        const { patientId } = req.query;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Missing patientId in query parameters'
            });
        }
        let objectId;
        try {
            objectId = new ObjectId(patientId);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid patientId format'
            });
        }
        const patient = await db.collection('users').findOne({ _id: objectId, role: 'patient' });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Only allow if requester is in access list or is the patient themselves
        if (requesterRole === 'doctor') {
            const access = await db.collection('accessList').findOne({ user: patientId, doctor: requesterId });
            if (!access) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: you are not authorized to view this patient details.'
                });
            }
        } else if (requesterRole === 'patient' && requesterId !== patientId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: you can only view your own details.'
            });
        }

        // Remove sensitive fields before sending
        const { password, ...patientDetails } = patient;
        patientDetails.files = await db.collection('files').find({ user: patientId }).toArray();
        patientDetails.prescriptions = await db.collection('prescriptions').find({ user: patientId }).toArray();
        Logger(`Patient details fetched for patient: ${patientId} by user: ${requesterId}`);
        res.status(200).json({
            success: true,
            data: patientDetails
        });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch patient details',
            error: error.message
        });
    }
})



export default router;

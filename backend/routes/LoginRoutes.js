// Every /login route should be in this file

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';
import sendEmail from '../Email.js';
import { Logger } from '../Utils/Logger.js';

const router = express.Router();

// Unified login route
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        if (user.role === 'doctor') {
            const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, receptionist: user.receptionist }, process.env.JWT_SECRET, { expiresIn: '1h' });
            Logger(`Doctor login successful: ${user._id}`);
            return res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, registrationNumber: user.registrationNumber, receptionist: user.receptionist } });
        }
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        Logger(`${user.role} login successful: ${user._id}`);
        return res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, registrationNumber: user.registrationNumber } });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// In-memory store for reset codes
const verificationCodes = new Map();

// Send password reset code
router.post("/reset-code", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(email, code);
        await sendEmail(email, code);
        Logger(`Password reset code sent to: ${email}`);
        return res.json({ message: 'Password reset code sent successfully' });
    } catch (error) {
        console.error('Error sending password reset code:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password with code
router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const storedCode = verificationCodes.get(email);
        if (!storedCode || storedCode !== code.toString()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.collection('users').updateOne({ email }, { $set: { password: hashed } });
        verificationCodes.delete(email);
        Logger(`Password reset successful for: ${user._id}`);
        return res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
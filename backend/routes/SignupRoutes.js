// Every /signup route should be in this file

import express from 'express';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';
import sendEmail from '../Email.js';
import { Logger } from '../Utils/Logger.js';

const router = express.Router();

// in-memory store for verification codes { email: code }
const verificationCodes = new Map();

// Send verification code
router.post('/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const db = await connectDB();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    try {
        const emailResult = await sendEmail(email, code);
        if (!emailResult) {
            return res.status(500).json({ message: 'Failed to send code' });
        }
        // auto-expire after 10 minutes
        verificationCodes.set(email, code.toString());
        setTimeout(() => verificationCodes.delete(email), 10 * 60 * 1000);
        Logger(`Verification code sent to: ${email}`);
        return res.json({ message: 'Code sent' });
    } catch (err) {
        console.error('Email send error', err);
        res.status(500).json({ message: 'Failed to send code' });
    }
});

// Unified signup route
router.post('/', async (req, res) => {
    const { name, email, password, role, registrationNumber, code } = req.body;
    if (!name || !email || !password || !role || !code) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (role === 'doctor' && !registrationNumber) {
        return res.status(400).json({ message: 'Registration number is required for doctors' });
    }
    const stored = verificationCodes.get(email);
    if (stored !== code) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    verificationCodes.delete(email);
    try {
        const db = await connectDB();
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            role,
        };
        if (role === 'doctor') {
            newUser.registrationNumber = registrationNumber;
        }
        const result = await db.collection('users').insertOne(newUser);
        Logger(`New user registered: ${email} with role: ${role}`);
        res.status(201).json({ message: 'User registered successfully', user: { ...newUser, _id: result.insertedId } });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
// Every /signup route should be in this file

import express from 'express';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';

const router = express.Router();

// Unified signup route
router.post('/', async (req, res) => {
    const { name, email, password, role, registrationNumber } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (role === 'doctor' && !registrationNumber) {
        return res.status(400).json({ message: 'Registration number is required for doctors' });
    }
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
            role,
        };
        if (role === 'doctor') {
            newUser.registrationNumber = registrationNumber;
        }
        await db.collection('users').insertOne(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
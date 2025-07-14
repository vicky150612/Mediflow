// Every /login route should be in this file

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';

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
            return res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, registrationNumber: user.registrationNumber, receptionist: user.receptionist } });
        }
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, registrationNumber: user.registrationNumber } });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB } from '../db.js';
import { Logger } from '../Utils/Logger.js';
import { ObjectId } from 'mongodb';
import { authMiddleware } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        email: payload.email,
        name: payload.name,
        email_verified: payload.email_verified,
    };
}

router.post('/', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Google token missing' });

    try {
        const { email, name, email_verified } = await verifyGoogleToken(token);
        if (!email_verified) {
            return res.status(403).json({ message: 'Email not verified by Google' });
        }
        const db = await connectDB();
        let user = await db.collection('users').findOne({ email });
        if (user) {
            // Existing user -> login
            const payload = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                receptionist: user.receptionist,
            };
            const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            Logger(`Google login successful: ${user._id}`);
            return res.json({ message: 'Login successful', token: jwtToken, user: payload, needsMoreInfo: false });
        }
        // New user -> create user with provider google
        const newUser = {
            name,
            email,
            provider: 'google',
            role: "NONE",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection('users').insertOne(newUser);
        const jwtToken = jwt.sign({ id: result.insertedId, email, name, provider: 'google', incomplete: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
        Logger(`Google signup initiated: ${email}`);
        return res.status(201).json({ message: 'Signup incomplete: additional info required', token: jwtToken, user: { id: result.insertedId, email, name }, needsMoreInfo: true });
    } catch (err) {
        console.error('Google auth error', err);
        return res.status(500).json({ message: 'Google authentication failed' });
    }
});

router.put('/complete', authMiddleware, async (req, res) => {
    const { username, role, registrationNumber } = req.body;
    const id = req.user.id;
    if (!username || !role) return res.status(400).json({ message: 'Missing required fields' });
    try {
        const db = await connectDB();
        const update = { name: username, role, updatedAt: new Date() };
        if (role === 'doctor') { update.registrationNumber = registrationNumber; }
        await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: update });
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        const payload = { id: user._id, name: user.name, email: user.email, role: user.role, receptionist: user.receptionist };
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        Logger(`Google profile completed: ${id}`);
        return res.json({ message: 'Profile completion successful', token: jwtToken, user: payload });
    } catch (err) {
        console.error('Profile completion error', err);
        return res.status(500).json({ message: 'Profile completion failed' });
    }
});

export default router;

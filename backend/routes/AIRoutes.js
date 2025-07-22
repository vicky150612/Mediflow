import express from "express";
import { GoogleGenAI } from "@google/genai";
import { connectDB } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post("/ask", authMiddleware, async (req, res) => {
    try {
        if (!req.body.text || typeof req.body.text !== 'string') {
            return res.status(400).json({ error: "Valid text input is required" });
        }

        const db = await connectDB();
        const prescriptions = await db.collection('prescriptions')
            .find({ user: req.user.id, status: "Active" })
            .toArray();

        const prescriptionContext = prescriptions.map(p =>
            `Title ${p.title}, Detailes ${p.details}`
        );
        const fullContext = [
            ...prescriptionContext,
            ...(req.body.context || [])
        ];

        // Create the prompt with context
        const promptWithContext = `
You are a medication assistant who replies in 4-5 sentences.

Current active prescriptions and context:
${fullContext.join('\n')}

User question: ${req.body.text}
        `.trim();

        const response = await ai.models.generateContent({
            model: "gemma-3n-e2b-it",
            contents: promptWithContext,
        });
        res.json({ text: response.text.replace(/\n/g, '') });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

export default router;

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized access... Missing token' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized access... Invalid token' });
    }
}

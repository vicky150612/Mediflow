import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';


// Import routes
import loginRoutes from './routes/LoginRoutes.js';
import signupRoutes from './routes/SignupRoutes.js';
import patientRoutes from './routes/PatientRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import doctorRoutes from './routes/DoctorRoutes.js';
import prescriptionRoutes from './routes/PrescriptionRoutes.js';

// Import middleware
import { authMiddleware } from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Define port
const PORT = process.env.PORT || 5000;

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Zense API' });
});

app.get('/me', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Return user details
  const id = req.user.id;
  if (!id) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Return user details
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role });
});

// Use routes
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/patient', patientRoutes);
app.use('/upload', uploadRoutes);
app.use('/doctor', doctorRoutes);
app.use('/prescription', prescriptionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
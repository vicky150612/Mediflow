import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import bodyParser from 'body-parser';
import { connectDB } from './db.js';
import cloudinary from 'cloudinary';


// Import routes
import loginRoutes from './routes/LoginRoutes.js';
import signupRoutes from './routes/SignupRoutes.js';
import patientRoutes from './routes/PatientRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import doctorRoutes from './routes/DoctorRoutes.js';
import prescriptionRoutes from './routes/PrescriptionRoutes.js';

import { ObjectId } from 'mongodb';

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

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

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

app.get('/me', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const id = req.user.id;
  if (!id) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, registrationNumber: req.user.registrationNumber, receptionist: req.user.receptionist });
});

app.delete('/me', authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const id = req.user.id;
  if (!id) {
    return res.status(404).json({ message: 'User not found' });
  }
  const db = await connectDB();
  const objectId = new ObjectId(id);
  const result = await db.collection('users').deleteOne({ _id: objectId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  await db.collection('accessList').deleteMany({ user: id });
  // Delete files
  const files = await db.collection('files').find({ user: id }).toArray();
  for (const file of files) {
    const publicId = file.public_id;
    cloudinary.v2.uploader.destroy(publicId, function (error, result) {
      console.log(result, error);
    });
  }
  await db.collection('files').deleteMany({ user: id });
  await db.collection('prescriptions').deleteMany({ user: id });
  // If the user is a doctor
  await db.collection('accessList').deleteMany({ doctor: id });
  return res.json({ message: 'User deleted' });
});

// Use routes
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/patient', patientRoutes);
app.use('/upload', uploadRoutes);
app.use('/doctor', doctorRoutes);
app.use('/prescription', prescriptionRoutes);


// Map user id to array of { socketId, role, name }
const usersocketmap = {};

io.on('connection', (socket) => {
  // User registers themselves with id, role, and name
  socket.on('userconnected', ({ userid, role, name }) => {
    if (!usersocketmap[userid]) usersocketmap[userid] = [];
    usersocketmap[userid] = { socketId: socket.id, role, name };
    socket.userid = userid;
    socket.role = role;
    socket.username = name;
  });

  // Doctor sends patient details to a receptionist
  socket.on('send_to_reception', ({ receptionistId, patientDetails, doctorDetails, prescription, audioDetails }, func) => {
    const rec = usersocketmap[receptionistId];
    let delivered = false;
    if (rec && rec.socketId) {
      io.to(rec.socketId).emit('receive_from_doctor', {
        patientDetails,
        doctorDetails,
        prescription,
        audioDetails,
        requestId: `${doctorDetails.id}_${Date.now()}`
      });
      delivered = true;
    }
    if (typeof func === 'function') {
      func({ success: delivered });
    }
  });


  // Receptionist marks as done
  socket.on('mark_as_done', async ({ patientDetails, doctorDetails, prescription, audioDetails, requestId }, func) => {
    try {
      const db = await connectDB();
      const newPrescription = {
        user: patientDetails.id,
        doctor: doctorDetails.id,
        doctorName: doctorDetails.name,
        title: prescription.title,
        details: prescription.details,
        audioDetails: audioDetails,
        date: new Date(),
        status: 'Active',
      };
      await db.collection('prescriptions').insertOne(newPrescription);
      socket.emit('request_removed', { requestId });
      if (typeof func === 'function') {
        func({ success: true });
      }
    } catch (error) {
      console.error('Error in mark_as_done:', error);
      if (typeof func === 'function') {
        func({ success: false, error: 'Failed to save prescription.' });
      }
    }
  });

  socket.on('disconnect', () => {
    for (const userid in usersocketmap) {
      delete usersocketmap[userid];
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
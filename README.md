# MediFlow - Modern Healthcare Management System

MediFlow is a comprehensive healthcare management platform designed to streamline communication and workflow between doctors, receptionists, and patients. Built with modern web technologies, MediFlow offers real-time updates, secure authentication, and an intuitive user interface.

---

## Features

### For Doctors
- Patient records access
- Instand Send to reception funtionality
- Prescription adding funtionality.
- Audio recording functionality.

### For Receptionists
- Real-time notifications.
- Prescription edit functionality.

### For Patients
- Secure access to medical records.
- Prescription tracking.
- Auromatic prescription sync.
- AI Assistant for medical queries.

---

If you dont want to dive deep into the code or working, you can refer to the [Workflow](/Workflow.md) for easier understanding of the website.

## Tech Stack

### Frontend
- **React** – Frontend library
- **Vite** – Build tool and development server
- **Tailwind CSS** – Utility-first CSS framework
- **ShadCN UI** – Component library
- **React Router** – Routing library
- **React Three Fiber** – 3D rendering
- **GSAP** – Animation library
- **Socket.IO Client** – Real-time communication

### Backend
- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **MongoDB** – NoSQL database
- **Socket.IO** – Real-time bidirectional communication
- **JWT** – Authentication
- **Cloudinary** – Media storage and management
- **Google OAuth** – Authentication
- **EmailJS** – Email functionality

---


## How to run
## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MongoDB instance (local or cloud)
- Google OAuth credentials
- Cloudinary account (for media storage)
- EmailJS account (for email functionality)

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_URI
# Authentication
JWT_SECRET=YOUR_JWT_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# EmailJS
EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
EMAILJS_PRIVATE_KEY=YOUR_EMAILJS_PRIVATE_KEY
EMAILJS_TEMPLATE_ID=YOUR_EMAILJS_TEMPLATE_ID
EMAILJS_SERVICE_ID=YOUR_EMAILJS_SERVICE_ID

# Brevo
BREVO_API_KEY=YOUR_BREVO_API_KEY

# AI API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

Then run the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with:

```env
VITE_API_URL=http://localhost:<port mentioned in the backend>
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

Start the dev server:

```bash
npm run dev
```

Navigate to: [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
MediFlow/
├── backend/               # Backend server code
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── index.js          # Main server file
│   ├── db.js             # Database connection file
│   ├── Email.js          # Email functionality file
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
│
└── frontend/             # Frontend React application
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Page components
        ├── assets/       # Images, fonts, etc.
        ├── App.jsx       # Main App component
        └── main.jsx      # Entry point
```

---

## API Documentation
If you need detailed documentations on backend api reter to [API Documentation](/API.md)

## Acknowledgments

* [React](https://reactjs.org/)
* [Express](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Socket.IO](https://socket.io/)
* [Tailwind CSS](https://tailwindcss.com/)
* [GSAP](https://greensock.com/gsap/)
* [shadcn/ui](https://ui.shadcn.com/)
* [react-router](https://reactrouter.com/)
* All other open-source libraries used in this project

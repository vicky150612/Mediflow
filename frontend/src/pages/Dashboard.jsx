import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';



const Dashboard = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_Backend_URL;
    useEffect(() => {
        const fetchRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await fetch(`${backendUrl}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userRole = await res.json();
            if (userRole) {
                setRole(userRole.role);
            } else {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setLoading(false);
        }
        fetchRole();
    });

    if (loading) return <div>Loading...</div>;
    if (role === 'doctor') return <DoctorDashboard />;
    if (role === 'patient') return <PatientDashboard />;
    navigate('/login');
    return null;
};

export default Dashboard; 
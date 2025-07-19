import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { Loader2 } from 'lucide-react';



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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    };
    if (role === 'doctor') return <DoctorDashboard />;
    if (role === 'patient') return <PatientDashboard />;
    if (role === 'receptionist') return <ReceptionistDashboard />;
    navigate('/login');
    return null;
};

export default Dashboard; 
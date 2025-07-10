import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`${import.meta.env.VITE_Backend_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch profile');
                return res.json();
            })
            .then(data => setProfile(data))
            .catch(() => {
                console.error('Could not load profile');
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!profile) return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;

    return (
        <div>
            <div>
                <h1>Patient Dashboard</h1>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>ID:</strong> {profile.id}</p>

                <button onClick={() => navigate('/files')}>
                    View Files
                </button>
                <button onClick={() => navigate('/accesslist')}>
                    View Access List
                </button>
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}
export default PatientDashboard;
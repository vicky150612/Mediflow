import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../index.css";
import LoadingSpinner from '../components/LoadingSpinner';

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

    if (!profile)
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
                <LoadingSpinner />
            </div>
        );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-lg flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Patient Dashboard</h1>
                <p className="mb-6 text-gray-500 text-sm">Welcome, <span className="font-semibold text-indigo-600">{profile.name}</span></p>
                <div className="w-full bg-indigo-50 rounded-lg p-4 mb-8 flex flex-col gap-2">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900">{profile.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900">{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Patient ID:</span>
                        <span className="text-gray-900">{profile.id}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => navigate('/files')}
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                    >
                        View Reports
                    </button>
                    <button
                        onClick={() => navigate('/accesslist')}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold shadow"
                    >
                        View Access List
                    </button>
                    <button
                        onClick={() => navigate('/prescriptions')}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold shadow"
                    >
                        View Prescriptions
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition font-semibold shadow mt-2"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
export default PatientDashboard;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../index.css";

const Signup = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.role = role;
        if (role !== 'doctor') delete data.registrationNumber;
        try {
            const res = await fetch(`${backendUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setSuccess('Signup successful! Please login.');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                const result = await res.json();
                setError(result.message || 'Signup failed');
            }
        } catch (err) {
            setError('Network error' + (err.message ? `: ${err.message}` : ''));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2 text-indigo-700">Create an Account</h2>
                <p className="mb-6 text-gray-500 text-sm">Sign up to get started with Mediflow</p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <div className="flex gap-6 mb-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="patient"
                                checked={role === 'patient'}
                                onChange={() => setRole('patient')}
                                className="accent-indigo-600 mr-2"
                            />
                            <span className="text-gray-700">Patient</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="doctor"
                                checked={role === 'doctor'}
                                onChange={() => setRole('doctor')}
                                className="accent-indigo-600 mr-2"
                            />
                            <span className="text-gray-700">Doctor</span>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            autoComplete="name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            autoComplete="email"
                        />
                    </div>
                    {role === 'doctor' && (
                        <div>
                            <label htmlFor="registrationNumber" className="block text-gray-700 mb-1 font-medium">Registration Number</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                id="registrationNumber"
                                required={role === 'doctor'}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">Signup</button>
                </form>
                {success && <p className="text-green-600">{success}</p>}
                {error && <p className="text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default Signup; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../index.css";


const Login = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            const res = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const result = await res.json();
                if (result.token) {
                    localStorage.setItem('token', result.token);
                    navigate('/dashboard');
                }
            } else {
                const result = await res.json();
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
            console.error('Network error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2 text-indigo-700">Welcome Back</h2>
                <p className="mb-6 text-gray-500 text-sm">Login to your Mediflow account</p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                    >
                        Login
                    </button>
                </form>
                {error && (
                    <p className="mt-4 text-red-600 text-center text-sm bg-red-50 border border-red-200 rounded p-2 w-full">{error}</p>
                )}
            </div>
        </div>
    );
};

export default Login;
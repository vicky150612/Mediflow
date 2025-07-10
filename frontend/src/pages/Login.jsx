import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" name="email" required />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" required />
                </label>
                <button type="submit">Login</button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default Login; 
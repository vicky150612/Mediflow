import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div>
            <h1>Signup</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="patient"
                        checked={role === 'patient'}
                        onChange={() => setRole('patient')}
                    /> Patient
                </label>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="doctor"
                        checked={role === 'doctor'}
                        onChange={() => setRole('doctor')}
                    /> Doctor
                </label>
                <br />
                <label>
                    Name:
                    <input type="text" name="name" required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" required />
                </label>
                {role === 'doctor' && (
                    <label>
                        Registration Number:
                        <input type="text" name="registrationNumber" required={role === 'doctor'} />
                    </label>
                )}
                <label>
                    Password:
                    <input type="password" name="password" required />
                </label>
                <button type="submit">Signup</button>
            </form>
            {success && <p>{success}</p>}
            {error && <p>{error}</p>}
        </div>
    );
};

export default Signup; 
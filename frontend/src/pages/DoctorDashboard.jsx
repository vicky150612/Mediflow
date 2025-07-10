import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState('');
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!localStorage.getItem('token')) {
            navigate('/login');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPatient(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_Backend_URL}/patient/details/?patientId=${search}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to fetch patient details');
                setPatient(null);
                return;
            }
            setPatient(data.data);
        } catch (error) {
            setError(error.message || 'Network error');
            setPatient(null);
        }
    }
    return (
        <div>
            <h1>Doctor Dashboard</h1>
            {profile && (
                <div>
                    <h2>Welcome, Dr. {profile.name}</h2>
                    <p>Email: {profile.email}</p>
                    <p>ID: {profile.id}</p>
                </div>
            )}
            <div>
                Searh bar
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Patient ID' onChange={(e) => setSearch(e.target.value)} />
                    <button type="submit">Search</button>
                </form>
            </div>
            {patient && (
                <div>
                    <h2>Patient Details</h2>
                    <p>Name: {patient.name}</p>
                    <p>Email: {patient.email}</p>
                    <p>ID: {patient._id}</p>
                    <div>
                        <ul>
                            {patient.files.map((item, index) => (
                                <li key={index}>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.filename}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {error && <p>{error}</p>}
            <button onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
            }}>Logout</button>
        </div>
    )
}

export default DoctorDashboard

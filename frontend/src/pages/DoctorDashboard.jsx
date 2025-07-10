import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../index.css";

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState('');
    const [patient, setPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Doctor Dashboard</h1>
                {profile && (
                    <div className="w-full bg-indigo-50 rounded-lg p-4 mb-6 flex flex-col gap-2">
                        <h2 className="text-xl font-semibold text-indigo-900 mb-1">Welcome, Dr. {profile.name}</h2>
                        <div className="flex flex-col md:flex-row md:gap-8">
                            <span className="text-gray-700">Email: <span className="text-gray-900">{profile.email}</span></span>
                            <span className="text-gray-700">ID: <span className="text-gray-900">{profile.id}</span></span>
                        </div>
                    </div>
                )}
                <div className="w-full mb-6">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Patient ID"
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                        >
                            Search
                        </button>
                    </form>
                </div>
                {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 w-full text-center">{error}</p>}
                {patient && (
                    <div
                        className="w-full bg-blue-50 rounded-lg p-4 mb-6 cursor-pointer hover:bg-blue-100 transition"
                        onClick={() => setShowPatientModal(true)}
                        title="View patient details"
                    >
                        <div className="flex flex-col md:flex-row md:gap-8 mb-2">
                            <span className="text-gray-700">Name: <span className="text-gray-900">{patient.name}</span></span>
                            <span className="text-gray-700">Email: <span className="text-gray-900">{patient.email}</span></span>
                            <span className="text-gray-700">ID: <span className="text-gray-900">{patient._id}</span></span>
                        </div>
                    </div>
                )}
                {showPatientModal && patient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg flex flex-col items-center relative animate-fadeIn">
                            <div className="w-full flex items-center justify-between px-8 py-4 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center bg-white bg-opacity-80 rounded-full p-2 shadow text-blue-700">
                                        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.104-.896-2-2-2s-2 .896-2 2 .896 2 2 2 2-.896 2-2zm0 0c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 8c-4 0-8-2-8-6V7a2 2 0 012-2h16a2 2 0 012 2v6c0 4-4 6-8 6z' /></svg>
                                    </span>
                                    <h2 className="text-lg font-bold text-white tracking-wide">Patient Details</h2>
                                </div>
                                <button
                                    className="rounded-full p-1 text-white hover:bg-white hover:text-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 text-2xl font-bold"
                                    onClick={() => setShowPatientModal(false)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="w-full px-8 py-6 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <div><span className="font-medium text-gray-700">Name:</span> {patient.name || 'N/A'}</div>
                                    <div><span className="font-medium text-gray-700">Email:</span> {patient.email || 'N/A'}</div>
                                    <div><span className="font-medium text-gray-700">ID:</span> {patient._id || 'N/A'}</div>
                                </div>
                                <hr className="my-2 border-gray-200" />
                                <div className="w-full">
                                    <h3 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                                        Files
                                    </h3>
                                    <ul className="divide-y divide-gray-200 rounded-lg overflow-hidden">
                                        {patient.files && patient.files.length > 0 ? (
                                            patient.files.map((item, index) => (
                                                <li key={index} className="py-2 px-3 flex justify-between items-center cursor-pointer hover:bg-indigo-50 transition">
                                                    <span className="text-gray-800 truncate max-w-xs">{item.filename}</span>
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 text-sm font-semibold px-3 py-1 rounded hover:bg-indigo-100 transition"
                                                    >
                                                        View
                                                    </a>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="py-2 text-gray-400 px-3">No files found.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition font-semibold shadow mt-2"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default DoctorDashboard

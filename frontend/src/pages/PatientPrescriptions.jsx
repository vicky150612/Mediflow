import React, { useEffect, useState } from "react";

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_Backend_URL}/prescription`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch prescriptions');
                const data = await response.json();
                setPrescriptions(data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch prescriptions');
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 py-10">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-4">My Prescriptions</h1>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><span className="text-indigo-600 animate-pulse">Loading...</span></div>
                ) : error ? (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4 w-full text-center mb-4">Error: {error}</div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-gray-500 bg-gray-50 border border-gray-200 rounded p-6 w-full text-center mb-4">No prescriptions found.</div>
                ) : (
                    <ul className="w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        {prescriptions.map((prescription, index) => (
                            <li key={index} className="py-4 px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-indigo-50 transition">
                                <div className="flex-1">
                                    <div className="text-gray-800 font-semibold mb-1">{prescription.prescription}</div>
                                    <div className="text-sm text-gray-500">Prescribed by: <span className="font-medium text-indigo-700">{prescription.doctorName || 'Doctor'}</span></div>
                                </div>
                                <div className="text-xs text-gray-400 md:text-right">{prescription.date ? new Date(prescription.date).toLocaleDateString() : ''}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
};

export default PatientPrescriptions;

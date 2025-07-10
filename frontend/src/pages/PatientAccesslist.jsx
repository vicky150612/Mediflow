import React, { useEffect, useState } from 'react';
import "../index.css";

const PatientAccesslist = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const [doctor, setDoctor] = useState(""); // for adding doctor
    const [doctorDetails, setDoctorDetails] = useState(null); // for viewing doctor details
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [error, setError] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch the access list from the backend
    useEffect(() => {
        setLoading(true);
        fetch(`${backendUrl}/patient/accesslist`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    setError('Failed to fetch access list');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    setList([]);
                } else {
                    setList(data.data || []);
                    setError('');
                }
            })
            .catch(error => {
                setError(error.message);
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [backendUrl]);

    function handleAddDoctor(e) {
        e.preventDefault();
        setError('');
        fetch(`${backendUrl}/patient/doc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ doctorId: doctor })
        })
            .then(response => {
                if (!response.ok) {
                    setError(response.message || 'Failed to add doctor');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    setError(data.message || 'Failed to add doctor1');
                }
                setDoctor('');
                // Re-fetch access list
                fetch(`${backendUrl}/patient/accesslist`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => res.json())
                    .then(data => setList(data.data || []));
            })
            .catch(error => {
                setError(error.message);
            });
    }

    function handleRemoveDoctor(Id) {
        fetch(`${backendUrl}/patient/doc/${Id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    setError(response.message || 'Failed to remove doctor');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    setError(data.message || 'Failed to remove doctor');
                }
                // Re-fetch access list
                fetch(`${backendUrl}/patient/accesslist`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(res => res.json())
                    .then(data => setList(data.data || []));
            })
            .catch(error => {
                setError(error.message);
            });
    }

    function handleDoctorModal(id) {
        fetch(`${backendUrl}/doctor/detailes/${id}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                setDoctorDetails(data.data || null);
                setShowDoctorModal(true);
            })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Doctor Access List</h1>
                <p className="mb-6 text-gray-500 text-sm">Manage which doctors have access to your records</p>
                <form onSubmit={handleAddDoctor} className="w-full flex flex-col md:flex-row gap-4 mb-6 items-center justify-center">
                    <input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        placeholder="Enter Doctor ID"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                    >
                        Add Doctor
                    </button>
                </form>
                {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 w-full text-center">{error}</p>}
                {loading ? (
                    <div className="text-indigo-700 text-center w-full">Loading...</div>
                ) : (
                    <ul className="w-full divide-y divide-gray-200">
                        {list.length === 0 && <li className="py-4 text-gray-400 text-center">No doctors have access yet.</li>}
                        {list.map(doc => (
                            <li
                                key={doc.doctor}
                                className="flex flex-col md:flex-row md:justify-between md:items-center py-3 px-2 hover:bg-indigo-50 rounded gap-2 cursor-pointer"
                                onClick={e => {
                                    // Prevent modal open if Remove button is clicked
                                    if (e.target.tagName !== 'BUTTON') handleDoctorModal(doc.doctor);
                                }}
                            >
                                <span className="font-medium text-gray-800">
                                    {doc.doctor}
                                </span>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleRemoveDoctor(doc.doctor);
                                    }}
                                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition font-semibold shadow"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                        {showDoctorModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center relative">
                                    <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                                        onClick={() => setShowDoctorModal(false)}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>
                                    <h2 className="text-lg font-bold mb-4 text-indigo-700">Doctor Details</h2>
                                    {doctorDetails ? (
                                        <div className="w-full flex flex-col gap-2">
                                            <div><span className="font-medium text-gray-700">Name:</span> {doctorDetails.name || 'N/A'}</div>
                                            <div><span className="font-medium text-gray-700">Email:</span> {doctorDetails.email || 'N/A'}</div>
                                            <div><span className="font-medium text-gray-700">Registration Number:</span> {doctorDetails.registrationNumber || 'N/A'}</div>
                                            <div><span className="font-medium text-gray-700">ID:</span> {doctorDetails._id || 'N/A'}</div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">No details found.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default PatientAccesslist

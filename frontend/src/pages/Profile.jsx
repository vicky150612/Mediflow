import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [receptionistId, setReceptionistId] = useState('');
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_Backend_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${backendUrl}/me`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok) throw new Error('Could not fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [backendUrl]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        try {
            const res = await fetch(`${backendUrl}/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Delete failed');
            setDeleteSuccess('Profile deleted. Redirecting...');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/signup'), 1500);
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete profile.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangeReceptionist = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        try {
            const res = await fetch(`${backendUrl}/doctor/receptionist`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receptionistId: receptionistId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');
            setDeleteSuccess('Receptionist updated. Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            setDeleteError(err.message || 'Failed to update profile.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-4">Profile</h1>
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : profile && (
                    <>
                        <div className="w-full flex flex-col gap-3 mb-4">
                            <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{profile.name}</span></div>
                            <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{profile.email}</span></div>
                            <div><span className="font-medium text-gray-700">Role:</span> <span className="text-gray-900 capitalize">{profile.role}</span></div>
                        </div>
                        {profile.role === 'doctor' && (
                            <div className="w-full flex flex-col gap-3 mb-4">
                                <div><span className="font-medium text-gray-700">Receptionist:</span> <span className="text-gray-900">{profile.receptionist ? profile.receptionist : 'Not assigned'}</span></div>
                                <input type="text" placeholder="Receptionist ID" value={receptionistId} onChange={(e) => setReceptionistId(e.target.value)} />
                                <button onClick={handleChangeReceptionist} className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition font-semibold shadow mt-2">
                                    Change Receptionist
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleDelete}
                            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition font-semibold shadow mt-2"
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete Profile'}
                        </button>
                        {deleteError && <p className="text-red-600 text-sm mt-2">{deleteError}</p>}
                        {deleteSuccess && <p className="text-green-600 text-sm mt-2">{deleteSuccess}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;

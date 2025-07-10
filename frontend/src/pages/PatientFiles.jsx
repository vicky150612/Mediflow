import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "../index.css";

const PatientFiles = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filename, setFilename] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');


    const fetchFiles = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/patient/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            const data = await response.json();
            setFiles(data.data || []);
        } catch (error) {
            console.error('Error fetching files:', error);
            if (error.message === 'Failed to fetch files') {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    }, [backendUrl, navigate]);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchFiles();
    }, [backendUrl, navigate, fetchFiles]);

    const handleFileChange = (e) => {
        setUploadedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadedFile || !filename) return;
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('filename', filename);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error('Upload failed');
            }
            setUploadMessage('File uploaded successfully!');
            setShowModal(false);
            await fetchFiles();
            setFilename('');
            setUploadedFile(null);
        } catch (err) {
            setUploadMessage('Upload failed: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
                <div className="text-xl text-indigo-700 font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Your Files</h1>
                <p className="mb-6 text-gray-500 text-sm">View and manage your uploaded files</p>
                <button
                    onClick={() => setShowModal(true)}
                    className="mb-6 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                >
                    Upload File
                </button>
                {uploadMessage && (
                    <div className={`mb-4 w-full text-center rounded p-2 ${uploadMessage.includes('success') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{uploadMessage}</div>
                )}
                <ul className="w-full divide-y divide-gray-200 mb-4">
                    {files.length === 0 && <li className="py-4 text-gray-400 text-center">No files uploaded yet.</li>}
                    {files.map(file => (
                        <li key={file._id} className="flex justify-between items-center py-3 px-2 hover:bg-indigo-50 rounded">
                            <span className="font-medium text-gray-800">{file.filename}</span>
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline text-sm font-semibold"
                            >
                                View
                            </a>
                        </li>
                    ))}
                </ul>
                {/* Modal for upload */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col items-center relative">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                                onClick={() => { setShowModal(false); setUploadMessage(''); }}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4 text-indigo-700">Upload File</h2>
                            <form onSubmit={handleUpload} className="w-full flex flex-col gap-4">
                                <div>
                                    <label htmlFor="filename" className="block text-gray-700 mb-1 font-medium">File Name</label>
                                    <input
                                        type="text"
                                        id="filename"
                                        value={filename}
                                        onChange={e => setFilename(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="file" className="block text-gray-700 mb-1 font-medium">Choose File</label>
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={handleFileChange}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-semibold shadow mt-2"
                                >
                                    Upload
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientFiles;
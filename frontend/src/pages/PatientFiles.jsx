import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

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
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Files</h1>
            <p>Here you can view and manage your uploaded files.</p>
            <button onClick={() => setShowModal(true)}>
                Upload File
            </button>
            <ul>
                {files.length === 0 && <li>No files uploaded yet.</li>}
                {files.map(file => (
                    <li key={file._id}>
                        {file.filename}
                        {" "}
                        <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                    </li>
                ))}
            </ul>

            {/* Upload Modal */}
            {showModal && (
                <div>
                    <div>
                        <form onSubmit={handleUpload}>
                            <label>File Name:</label>
                            <input
                                type="text"
                                name="filename"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                required
                            />
                            <input
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            <div>
                                <button
                                    type="submit"
                                    disabled={!uploadedFile}
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload message notification */}
            {uploadMessage && (
                <div>
                    {uploadMessage}
                </div>
            )}
        </div>
    )
}

export default PatientFiles;
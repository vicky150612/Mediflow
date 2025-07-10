import React, { useEffect, useState } from 'react';


const PatientAccesslist = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const [doctor, setDoctor] = useState("");
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

    return (
        <div>
            <h1>Patient Access List</h1>
            <p>This page will display the list of doctors who have access to your records.</p>
            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : list.length > 0 ? (
                    <ul>
                        {list.map((item, index) => (
                            <li key={index}>
                                ID: {item.doctor}<br />
                                <button onClick={() => handleRemoveDoctor(item.doctor)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No access list found.</p>
                )}
            </div>
            <div>
                <form onSubmit={handleAddDoctor}>
                    <input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        placeholder="Enter doctor's ID"
                    />
                    <button type="submit">
                        Add New Doctor
                    </button>
                </form>
            </div>
            {error && <p>{error}</p>}
        </div>
    )
}

export default PatientAccesslist

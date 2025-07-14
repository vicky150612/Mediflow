import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { io } from "socket.io-client";

const ReceptionistDashboard = () => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedPrescription, setEditedPrescription] = useState("");
    const [requests, setRequests] = useState([]);
    const socketRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_Backend_URL;

    useEffect(() => {
        if (!profile) return;
        if (socketRef.current) return;
        const socket = io(import.meta.env.VITE_Backend_URL, {
            transports: ["websocket"],
            auth: {
                token: localStorage.getItem("token"),
            },
            withCredentials: true,
        });
        socketRef.current = socket;
        socket.on("connect", () => {
            socket.emit("userconnected", {
                userid: profile.id,
                role: "receptionist",
                name: profile.name,
            });
        });
        socket.on("reconnect", () => {
            socket.emit("userconnected", {
                userid: profile.id,
                role: "receptionist",
                name: profile.name,
            });
        });
        socket.on("receive_from_doctor", (data) => {
            setRequests((prev) => [...prev, data]);
        });
        socket.on("request_removed", ({ requestId }) => {
            setRequests((prev) => prev.filter((req) => req.requestId !== requestId));
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${backendUrl}/me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!res.ok) throw new Error("Could not fetch profile");
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [backendUrl]);

    const handleMarkAsDone = (doctorDetails, patientDetails, prescription, requestId) => {
        if (socketRef.current) {
            socketRef.current.emit("mark_as_done", {
                patientDetails,
                doctorDetails,
                prescription,
                requestId,
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleEditClick = (idx, prescription) => {
        setEditingIndex(idx);
        setEditedPrescription(prescription || "");
    };
    const handleCancelEdit = (e) => {
        if (e) e.preventDefault();
        setEditingIndex(null);
        setEditedPrescription("");
    };
    const handleSaveEdit = (idx) => {
        setRequests(prev => prev.map((req, i) =>
            i === idx ? { ...req, prescription: editedPrescription } : req
        ));
        setEditingIndex(null);
        setEditedPrescription("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Receptionist Dashboard</h1>
                <p className="mb-6 text-gray-500 text-sm">Welcome to Mediflow, Receptionist!</p>
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : profile && (
                    <>
                        <div className="w-full flex flex-col gap-2 mb-6">
                            <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{profile.name}</span></div>
                            <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{profile.email}</span></div>
                            <div><span className="font-medium text-gray-700">Receptionist ID:</span> <span className="text-gray-900 capitalize">{profile.id}</span></div>
                        </div>
                        <div className="w-full flex flex-col gap-4 mb-6">
                            <button
                                onClick={() => navigate("/profile")}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold shadow"
                            >
                                Logout
                            </button>
                        </div>
                        {/* Real-time requests from doctors */}
                        <div className="w-full bg-indigo-50 rounded-lg p-4">
                            <h2 className="text-lg font-bold text-indigo-700 mb-2">Incoming Requests</h2>
                            {requests.length === 0 ? (
                                <div className="text-gray-400">No requests yet.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {requests.map((req, idx) => (
                                        <li key={req.requestId || idx} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-gray-800">Patient: {req.patientDetails?.name} ({req.patientDetails?.id})</div>
                                                <div className="text-gray-600 text-sm">From Dr. {req.doctorDetails?.name} ({req.doctorDetails?.id})</div>
                                                <div>
                                                    {editingIndex === idx ? (
                                                        <div className="mt-1">
                                                            <textarea
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                                                                value={editedPrescription}
                                                                onChange={e => setEditedPrescription(e.target.value)}
                                                                rows={2}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                                                                    onClick={() => handleSaveEdit(idx)}
                                                                >Save</button>
                                                                <button
                                                                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400"
                                                                    onClick={handleCancelEdit}
                                                                >Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        req.prescription && (
                                                            <div
                                                                className="text-green-700 text-sm mt-1 cursor-pointer hover:underline"
                                                                title="Click to edit"
                                                                onClick={() => handleEditClick(idx, req.prescription)}
                                                            >
                                                                Prescription: {req.prescription}
                                                            </div>
                                                        )
                                                    )}
                                                    <button
                                                        onClick={() => handleMarkAsDone(req.doctorDetails, req.patientDetails, req.prescription, req.requestId)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold shadow mt-2 md:mt-0"
                                                    >
                                                        Mark as Done
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReceptionistDashboard;

import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const PrescriptionForm = ({ onClose, patientDetails, doctorDetails }) => {
    const [prescription, setPrescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(backendUrl, {
            transports: ["websocket"],
            auth: {
                token: localStorage.getItem("token"),
            },
            withCredentials: true,
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [backendUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        if (socketRef.current) {
            socketRef.current.emit("send_to_reception", {
                receptionistId: doctorDetails.receptionist,
                patientDetails,
                doctorDetails,
                prescription,
            }, (response) => {
                if (response && response.success) {
                    setSuccess("Prescription sent to receptionist!");
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                    }, 700);
                } else {
                    setError("Failed to deliver to receptionist. Please try again.");
                    setLoading(false);
                }
            });
        } else {
            setError("Socket not connected. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col items-center relative animate-fadeIn">
                <div className="w-full flex items-center justify-between px-8 py-4 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center bg-white bg-opacity-80 rounded-full p-2 shadow text-blue-700">
                            <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m7-7v14' /></svg>
                        </span>
                        <h2 className="text-lg font-bold text-white tracking-wide">Add Prescription</h2>
                    </div>
                    <button
                        className="rounded-full p-1 text-white hover:bg-white hover:text-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 text-2xl font-bold"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <div className="w-full px-8 py-6 flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        <label className="font-semibold text-gray-700">Prescription</label>
                        <textarea
                            value={prescription}
                            onChange={e => setPrescription(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            rows={4}
                            required
                            placeholder="Enter prescription details..."
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send to Reception"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionForm;
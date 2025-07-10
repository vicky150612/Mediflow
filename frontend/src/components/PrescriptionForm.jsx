import React, { useState } from "react";

const PrescriptionForm = ({ patientId, onSuccess }) => {
    const [prescription, setPrescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const backendUrl = import.meta.env.VITE_Backend_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/prescription/doc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ patientId, prescription }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setSuccess("Prescription added successfully!");
                setPrescription("");
                if (onSuccess) onSuccess();
            } else {
                setError(result.message || "Failed to add prescription");
            }
        } catch (err) {
            setError("Network error: " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
                value={prescription}
                onChange={e => setPrescription(e.target.value)}
                placeholder="Write prescription here..."
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[80px]"
                required
            />
            <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-semibold shadow"
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Prescription"}
            </button>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-1">{success}</p>}
        </form>
    );
};

export default PrescriptionForm;
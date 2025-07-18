import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { Textarea } from "./ui/textarea";

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
        <Card className="w-full max-w-lg shadow-xl p-4">
            <CardHeader>
                <CardTitle>Add Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="font-medium mb-2">Prescription</label>
                    <Textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        className="w-full min-h-[120px] rounded-md border-input bg-transparent px-4 py-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        rows={4}
                        required
                        placeholder="Enter prescription details..."
                    />
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="default">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
            <CardFooter className="justify-end space-x-3">
                <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <LoadingSpinner className="size-4 mr-2" />}Send to Reception
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PrescriptionForm;
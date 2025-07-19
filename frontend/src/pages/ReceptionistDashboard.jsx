import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    User,
    Stethoscope,
    Clock,
    CheckCircle,
    Edit3,
    Save,
    X,
    AlertCircle,
    FileText,
    LogOut,
    MessageSquare,
    Calendar,
    Phone,
    Loader2
} from "lucide-react";
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
            setRequests((prev) => [...prev, { ...data, timestamp: new Date() }]);
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


    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        Welcome, {profile?.name || 'Receptionist'}
                                    </CardTitle>
                                    <CardDescription className="text-purple-100 mt-1">
                                        Managing incoming prescription requests
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                    onClick={() => navigate('/profile')}>
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (socketRef.current) {
                                            socketRef.current.disconnect();
                                        }
                                        localStorage.removeItem("token");
                                        navigate("/login");
                                    }}
                                    className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between w-full">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    Incoming Prescription Requests
                                </CardTitle>
                                <span
                                    className="inline-flex items-center bg-black/90 text-white font-bold text-lg px-4 py-1 rounded-full shadow-md border-2 border-black">
                                    <Clock className="h-5 w-5 mr-2" />
                                    {requests.length} Pending
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No requests yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    New prescription requests from doctors will appear here automatically
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-4">
                                    {requests.map((req, idx) => (
                                        <Card key={req.requestId || idx} className="border-l-4 border-l-blue-500 transition-all hover:shadow-md">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-12 w-12 ">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                                                {req.patientDetails.name[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                {req.patientDetails?.name}
                                                            </h3>
                                                            <Badge variant="secondary" className="text-xs">
                                                                ID: {req.patientDetails?.id}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(req.timestamp)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Stethoscope className="h-3 w-3" />
                                                            Dr. {req.doctorDetails?.name}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator className="my-4" />

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <FileText className="h-4 w-4" />
                                                        <span>Prescription Details</span>
                                                    </div>

                                                    {editingIndex === idx ? (
                                                        <div className="space-y-3">
                                                            <Textarea
                                                                value={editedPrescription}
                                                                onChange={(e) => setEditedPrescription(e.target.value)}
                                                                placeholder="Enter prescription details..."
                                                                className="min-h-[100px] resize-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSaveEdit(idx)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Save className="h-3 w-3" />
                                                                    Save Changes
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={handleCancelEdit}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {req.prescription ? (
                                                                <div
                                                                    className="bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted/70 transition-colors border border-dashed border-muted-foreground/25"
                                                                    onClick={() => handleEditClick(idx, req.prescription)}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <p className="text-sm text-muted-foreground mb-2">
                                                                            Click to edit prescription
                                                                        </p>
                                                                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                    <p className="text-sm">{req.prescription}</p>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="bg-muted/30 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors border border-dashed border-muted-foreground/25"
                                                                    onClick={() => handleEditClick(idx, "")}
                                                                >
                                                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                                        <Edit3 className="h-4 w-4" />
                                                                        <span className="text-sm">Click to add prescription details</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <Separator className="my-4" />

                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={() => handleMarkAsDone(
                                                            req.doctorDetails,
                                                            req.patientDetails,
                                                            req.prescription,
                                                            req.requestId
                                                        )}
                                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Mark as Complete
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;

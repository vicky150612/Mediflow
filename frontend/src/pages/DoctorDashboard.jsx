import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import {
    Search,
    User,
    FileText,
    Plus,
    Eye,
    Mail,
    IdCard,
    AlertCircle,
    Stethoscope,
    Calendar,
    LogOut,
    Loader2
} from "lucide-react";
import "../index.css";

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState('');
    const [patient, setPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [error, setError] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(false);

    // Prescription form state
    const [prescription, setPrescription] = useState({ title: "", details: "" });
    const [prescriptionLoading, setPrescriptionLoading] = useState(false);
    const [prescriptionError, setPrescriptionError] = useState("");
    const [prescriptionSuccess, setPrescriptionSuccess] = useState("");
    const socketRef = useRef(null);
    const backendUrl = import.meta.env.VITE_Backend_URL;

    useEffect(() => {
        setProfileLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`${backendUrl}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch profile');
                return res.json();
            })
            .then(data => setProfile(data))
            .catch(() => {
                console.error('Could not load profile');
                localStorage.removeItem('token');
                navigate('/login');
            })
            .finally(() => setProfileLoading(false));
    }, [navigate, backendUrl]);

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

    const handlePatientSearch = async (e) => {
        e.preventDefault();
        setError('');
        setPatient(null);
        setShowPatientModal(false);
        setPatientLoading(true);

        try {
            const res = await fetch(`${backendUrl}/patient/details/?patientId=${search}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to fetch patient details');
                setPatient(null);
                setPatientLoading(false);
                return;
            }
            setPatient(data.data);
            setError('');
        } catch (error) {
            setError(error.message || 'Network error');
            setPatient(null);
        } finally {
            setPatientLoading(false);
        }
    };

    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        setPrescriptionError("");
        setPrescriptionSuccess("");
        setPrescriptionLoading(true);

        if (socketRef.current) {
            socketRef.current.emit("send_to_reception", {
                receptionistId: profile.receptionist,
                patientDetails: {
                    name: patient.name,
                    email: patient.email,
                    id: patient._id,
                },
                doctorDetails: {
                    name: profile.name,
                    email: profile.email,
                    id: profile.id,
                    receptionist: profile.receptionist,
                },
                prescription: prescription,
            }, (response) => {
                if (response.success) {
                    setPrescriptionSuccess("Prescription sent to reception successfully!");
                    setTimeout(() => {
                        setPrescriptionLoading(false);
                        setShowPrescriptionModal(false);
                        setPrescription({ title: "", details: "" });
                        setPrescriptionSuccess("");
                        setPatient(null);
                        setSearch("");
                        setError("");
                    }, 1000);
                } else {
                    setPrescriptionError("Failed to deliver to receptionist. Please try again.");
                    setPrescriptionLoading(false);
                }
            });
        } else {
            setPrescriptionError("Socket not connected. Please try again.");
            setPrescriptionLoading(false);
        }
    };

    const handlePrescriptionModalClose = () => {
        setShowPrescriptionModal(false);
        setPrescription({ title: "", details: "" });
        setPrescriptionError("");
        setPrescriptionSuccess("");
    };

    if (profileLoading) {
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
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        Welcome back, Dr. {profile?.name || 'Doctor'}
                                    </CardTitle>
                                    <CardDescription className="text-blue-100 mt-1">
                                        Manage your patients and prescriptions
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date().toLocaleDateString()}</span>
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

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Patient Search
                        </CardTitle>
                        <CardDescription>
                            Enter a patient ID to view their details and manage prescriptions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handlePatientSearch} className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Enter Patient ID"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={patientLoading}>
                                {patientLoading ? <Loader2 className="size-4 mr-2" /> : null}
                                Search
                            </Button>
                        </form>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {patient && !error && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                                        {patient.name[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{patient.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{patient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IdCard className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary">{patient._id}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowPatientModal(true)} >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh]">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Medical Files
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[60vh]">
                                            {patient.files && patient.files.length > 0 ? (
                                                <div className="space-y-2">
                                                    {patient.files.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium truncate max-w-xs">
                                                                    {file.filename}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                    View
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-sm">No files available</p>
                                            )}
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
                                    <DialogTrigger asChild>
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Prescription
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Add Prescription</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="prescription-title">Title</Label>
                                                    <Input
                                                        id="prescription-title"
                                                        value={prescription.title}
                                                        onChange={(e) => setPrescription(prev => ({ ...prev, title: e.target.value }))}
                                                        placeholder="Prescription Title"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="prescription-details">Details</Label>
                                                    <Textarea
                                                        id="prescription-details"
                                                        value={prescription.details}
                                                        onChange={(e) => setPrescription(prev => ({ ...prev, details: e.target.value }))}
                                                        className="min-h-[120px]"
                                                        rows={4}
                                                        placeholder="Prescription Details"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {prescriptionError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{prescriptionError}</AlertDescription>
                                                </Alert>
                                            )}

                                            {prescriptionSuccess && (
                                                <Alert variant="default">
                                                    <AlertDescription>{prescriptionSuccess}</AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="flex justify-end space-x-3">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={handlePrescriptionModalClose}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={prescriptionLoading}>
                                                    {prescriptionLoading && <Loader2 className="size-4 mr-2" />}
                                                    Send to Reception
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default DoctorDashboard;
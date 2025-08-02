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
import { ModeToggle } from "@/components/Toggle";
import { ReactMediaRecorder } from "react-media-recorder";
import { io } from "socket.io-client";
import "../index.css";

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [search, setSearch] = useState('');
    const [patient, setPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState('files');
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [error, setError] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(false);

    // Prescription form state
    const [prescription, setPrescription] = useState({ title: "", details: "" });
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");
    const [audio, setAudio] = useState(null);
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

        let audioDetailsToSend = audio;
        if (!audio && audioBlob) {
            try {
                const fileType = audioBlob.type || 'audio/webm';
                const file = new File([audioBlob], `doctor-audio-${Date.now()}.webm`, { type: fileType });
                const formData = new FormData();
                formData.append('audio', file);
                const res = await fetch(`${backendUrl}/upload/audio`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: formData
                });
                if (!res.ok) throw new Error('Audio upload failed');
                const data = await res.json();
                audioDetailsToSend = { url: data.url, public_id: data.public_id };
                setAudio(audioDetailsToSend);
            } catch (err) {
                setPrescriptionError('Failed to upload audio: ' + (err.message || ''));
                setPrescriptionLoading(false);
                return;
            }
        }

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
                prescription: { ...prescription },
                audioDetails: audioDetailsToSend || null
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
                        setAudioBlob(null);
                        setAudioUrl("");
                        setAudio(null);
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
        setAudioBlob(null);
        setAudioUrl("");
        setPrescriptionError("");
        setPrescriptionSuccess("");
    };
    const openPatientModal = () => {
        setSelectedTab('files');
        setShowPatientModal(true);
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md shadow-lg bg-card text-foreground border-border border">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-0 shadow-lg bg-card text-foreground">
                    <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-muted rounded-full">
                                    <Stethoscope className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        Welcome back, Dr. {profile?.name || 'Doctor'}
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your patients and prescriptions
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{new Date().toLocaleDateString()}</span>
                                <ModeToggle />
                                <Button
                                    variant="outline"
                                    size="sm"
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
                                    }}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="shadow-lg bg-card border border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Patient Search
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
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
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {patient && !error && (
                    <Card className="shadow-lg bg-card border border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Patient Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-lg font-semibold bg-muted text-primary">
                                        {patient.name[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-foreground">{patient.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">{patient.email}</span>
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
                                        <Button variant="outline" className="flex items-center gap-2" onClick={openPatientModal}>
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
                                        <DialogHeader>
                                            <DialogTitle>Patient Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex border-b border-border pb-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTab('files')}
                                                className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm ${selectedTab === 'files'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Medical Files
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTab('prescriptions')}
                                                className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm ${selectedTab === 'prescriptions'
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Prescriptions
                                            </button>
                                        </div>
                                        <ScrollArea className="flex-1 overflow-y-auto">
                                            <div className="pr-4">
                                            {selectedTab === 'files' && (
                                                <>
                                                    {patient.files && patient.files.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {patient.files.map((file, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted">
                                                                    <div className="flex items-center gap-3">
                                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium truncate max-w-xs text-foreground">
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
                                                </>
                                            )}

                                            {selectedTab === 'prescriptions' && (
                                                <>
                                                    {patient.prescriptions && patient.prescriptions.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {patient.prescriptions.map((presc, idx) => (
                                                                <div
                                                                    key={presc._id || idx}
                                                                    className="p-4 rounded-lg border border-border bg-muted flex flex-col gap-1"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-foreground">{presc.title}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {presc.date ? new Date(presc.date).toLocaleDateString() : ''}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                                                                        {presc.details}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm">No prescriptions available</p>
                                                    )}
                                                </>
                                            )}
                                            </div>
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
                                                    />
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block font-medium mb-1">Audio Instructions (optional)</label>
                                                    <ReactMediaRecorder
                                                        audio
                                                        render={({ status, startRecording, stopRecording, mediaBlobUrl, clearBlob }) => (
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex gap-2 items-center">
                                                                    <Button type="button" size="sm" onClick={startRecording} disabled={status === 'recording'}>
                                                                        {status === 'recording' ? 'Recording...' : 'Start Recording'}
                                                                    </Button>
                                                                    <Button type="button" size="sm" onClick={stopRecording} disabled={status !== 'recording'}>
                                                                        Stop
                                                                    </Button>
                                                                    <Button type="button" size="sm" variant="outline" onClick={() => { clearBlob(); setAudioBlob(null); setAudioUrl(""); setAudio(null); }} disabled={!mediaBlobUrl}>
                                                                        Clear
                                                                    </Button>
                                                                </div>
                                                                {mediaBlobUrl && (
                                                                    <div className="flex flex-col gap-2 mt-2">
                                                                        <audio controls src={mediaBlobUrl} className="w-full" />
                                                                        <span className="text-xs text-muted-foreground">Preview your recording</span>
                                                                    </div>
                                                                )}
                                                                {mediaBlobUrl && (
                                                                    <input type="hidden" value={mediaBlobUrl} />
                                                                )}
                                                                {mediaBlobUrl && !audioBlob && (
                                                                    <Button type="button" size="sm" onClick={async () => {
                                                                        const res = await fetch(mediaBlobUrl);
                                                                        const blob = await res.blob();
                                                                        setAudioBlob(blob);
                                                                        setAudioUrl(mediaBlobUrl);
                                                                    }}>Attach Recording</Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {prescriptionError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
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

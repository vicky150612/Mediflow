import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Users,
    UserPlus,
    Trash2,
    Eye,
    ArrowLeft,
    AlertCircle,
    Loader2
} from "lucide-react";
import "../index.css";


const PatientAccesslist = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState("");
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [error, setError] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // Fetch the access list from the backend
    useEffect(() => {
        fetchAccessList();
    }, [backendUrl]);

    const fetchAccessList = () => {
        setLoading(true);
        fetch(`${backendUrl}/patient/accesslist`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch access list');
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
    };

    function handleAddDoctor(e) {
        e.preventDefault();
        if (!doctor.trim()) return;

        setAddingDoctor(true);
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
                    throw new Error(response.message || 'Failed to add doctor');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.message || 'Failed to add doctor');
                }
                setDoctor('');
                fetchAccessList();
            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => setAddingDoctor(false));
    }

    function handleRemoveDoctor(Id) {
        setRemovingId(Id);
        setError('');

        fetch(`${backendUrl}/patient/doc/${Id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.message || 'Failed to remove doctor');
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.message || 'Failed to remove doctor');
                }
                fetchAccessList();
            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => setRemovingId(null));
    }

    function handleDoctorModal(id) {
        fetch(`${backendUrl}/doctor/detailes/${id}`)
            .then(response => response.json())
            .then(data => {
                setDoctorDetails(data.data || null);
                setShowDoctorModal(true);
            })
            .catch(() => {
                setDoctorDetails(null);
                setShowDoctorModal(true);
            });
    }

    return (
        <div className="min-h-screen bg-background p-4 text-foreground">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Access Control</h1>
                        <p className="text-sm text-muted-foreground">Manage doctor permissions</p>
                    </div>
                </div>

                <Card className="bg-card text-foreground border border-border">
                    <CardContent className="pt-4">
                        <form onSubmit={handleAddDoctor} className="flex gap-2">
                            <Input
                                value={doctor}
                                onChange={(e) => setDoctor(e.target.value)}
                                placeholder="Enter Doctor ID"
                                className="flex-1"
                                disabled={addingDoctor}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={addingDoctor || !doctor.trim()}
                                className="px-4"
                            >
                                {addingDoctor ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                        {error && (
                            <Alert variant="destructive" className="mt-3">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card text-foreground border border-border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Authorized Doctors
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {list.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {loading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : list.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No doctors added yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {list.map(doc => (
                                    <div
                                        key={doc.doctor}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted group transition-colors"
                                    >
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleDoctorModal(doc.doctor)}
                                        >
                                            <p className="font-medium text-foreground select-text">{doc.doctor}</p>
                                            <p className="text-xs text-muted-foreground">Click to view details</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDoctorModal(doc.doctor)}
                                                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveDoctor(doc.doctor)}
                                                disabled={removingId === doc.doctor}
                                                className="h-8 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors"
                                            >
                                                {removingId === doc.doctor ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-destructive" />
                                                ) : (
                                                    <Trash2 className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Doctor Details Modal */}
                <Dialog open={showDoctorModal} onOpenChange={setShowDoctorModal}>
                    <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
                        <DialogHeader>
                            <DialogTitle className="text-base">Doctor Details</DialogTitle>
                        </DialogHeader>
                        {doctorDetails ? (
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="col-span-2 font-medium">{doctorDetails.name || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="col-span-2 font-medium">{doctorDetails.email || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Reg. No:</span>
                                    <span className="col-span-2 font-medium">{doctorDetails.registrationNumber || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="col-span-2 font-mono text-xs select-text">{doctorDetails._id || 'N/A'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No details available</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default PatientAccesslist;

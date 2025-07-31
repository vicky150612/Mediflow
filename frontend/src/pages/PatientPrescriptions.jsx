import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Pill,
    Calendar,
    UserCheck,
    ArrowLeft,
    AlertCircle,
    Stethoscope,
    Loader2,
    Trash2,
    ShieldOff
} from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";

const PatientPrescriptions = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_Backend_URL}/prescription`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch prescriptions');
                const data = await response.json();
                setPrescriptions(data.data || []);
            } catch (err) {
                setError('Failed to fetch prescriptions');
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                        <h1 className="text-xl font-bold">My Prescriptions</h1>
                        <p className="text-sm text-muted-foreground">View your prescribed medications</p>
                    </div>
                </div>

                <Card className="bg-card text-foreground border border-border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Prescriptions
                            </CardTitle>
                            {!loading && (
                                <Badge variant="secondary" className="text-xs">
                                    {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : prescriptions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Pill className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No prescriptions found</p>
                                <p className="text-xs mt-1">Your prescribed medications will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {prescriptions.map((prescription, index) => (
                                    <Dialog key={prescription._id || index}>
                                        <DialogTrigger asChild>
                                            <div
                                                className="flex items-start justify-between p-3 rounded-lg hover:bg-muted group cursor-pointer"
                                                onClick={() => setSelected(prescription)}
                                            >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-primary/20 rounded-lg mt-0.5">
                                                        <Pill className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-foreground mb-1 leading-tight truncate">
                                                            {prescription.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Stethoscope className="h-3 w-3" />
                                                                <span>{prescription.doctorName || 'Doctor'}</span>
                                                            </div>
                                                            {prescription.date && (
                                                                <>
                                                                    <span>•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{formatDate(prescription.date)}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={prescription.status === 'Active' ? 'default' : 'secondary'}
                                                    className={`text-xs ${prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    {prescription.status}
                                                </Badge>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="bg-card text-foreground border border-border p-6 rounded-md">
                                            <DialogHeader>
                                                <DialogTitle>{prescription.title}</DialogTitle>
                                                <DialogDescription className="mb-2 text-muted-foreground">
                                                    Prescribed by Dr. {prescription.doctorName || 'Doctor'} on {formatDate(prescription.date)}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="mb-4">
                                                <p className="text-base font-medium mb-2">Details</p>
                                                <p className="whitespace-pre-line text-foreground mb-2">{prescription.details}</p>
                                                {prescription.audioDetails?.url && (
                                                    <div className="mt-3">
                                                        <label className="block text-xs text-muted-foreground mb-1">Audio Instructions</label>
                                                        <audio
                                                            controls
                                                            src={prescription.audioDetails.url}
                                                            className="w-full rounded shadow border border-muted/20"
                                                        >
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    </div>
                                                )}
                                                <Badge
                                                    variant={prescription.status === 'Active' ? 'default' : 'secondary'}
                                                    className={`text-xs ${prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    {prescription.status}
                                                </Badge>
                                            </div>
                                            <DialogFooter className="flex space-x-2">
                                                {prescription.status === 'Active' && (
                                                    <Button
                                                        variant="outline"
                                                        className="text-yellow-700 border-yellow-400 hover:bg-yellow-100 flex items-center gap-2"
                                                        disabled={actionLoading}
                                                        onClick={async () => {
                                                            setActionLoading(true);
                                                            try {
                                                                const res = await fetch(
                                                                    `${import.meta.env.VITE_Backend_URL}/prescription/${prescription._id}`,
                                                                    {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                            'Content-Type': 'application/json',
                                                                        },
                                                                        body: JSON.stringify({ status: 'Completed' }),
                                                                    }
                                                                );
                                                                if (!res.ok) throw new Error('Failed to deactivate');
                                                                setSelected(null);
                                                                const response = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription`, {
                                                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                                                });
                                                                const data = await response.json();
                                                                setPrescriptions(data.data || []);
                                                            } catch {
                                                                setError('Failed to deactivate prescription');
                                                            } finally {
                                                                setActionLoading(false);
                                                            }
                                                        }}
                                                    >
                                                        <ShieldOff className="h-4 w-4 mr-1" />
                                                        Mark as Completed
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    className="flex items-center gap-2"
                                                    disabled={actionLoading}
                                                    onClick={async () => {
                                                        setActionLoading(true);
                                                        try {
                                                            const res = await fetch(
                                                                `${import.meta.env.VITE_Backend_URL}/prescription/${prescription._id}`,
                                                                {
                                                                    method: 'DELETE',
                                                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                                                }
                                                            );
                                                            if (!res.ok) throw new Error('Failed to delete');
                                                            setSelected(null);
                                                            const response = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription`, {
                                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                                            });
                                                            const data = await response.json();
                                                            setPrescriptions(data.data || []);
                                                        } catch (err) {
                                                            setError('Failed to delete prescription');
                                                        } finally {
                                                            setActionLoading(false);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PatientPrescriptions;

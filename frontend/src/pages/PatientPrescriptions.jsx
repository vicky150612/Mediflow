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
        <div className="min-h-screen bg-slate-50 p-4">
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
                        <h1 className="text-xl font-bold text-slate-900">My Prescriptions</h1>
                        <p className="text-sm text-slate-600">View your prescribed medications</p>
                    </div>
                </div>

                <Card>
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
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            </div>
                        ) : error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : prescriptions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Pill className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No prescriptions found</p>
                                <p className="text-xs text-slate-400 mt-1">Your prescribed medications will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {prescriptions.map((prescription, index) => (
                                    <Dialog key={prescription._id || index}>
                                        <DialogTrigger asChild>
                                            <div
                                                className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 group cursor-pointer"
                                                onClick={() => setSelected(prescription)}
                                            >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                                                        <Pill className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 mb-1 leading-tight">
                                                            {prescription.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
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
                                                    className={`text-xs ${prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    {prescription.status}
                                                </Badge>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{prescription.title}</DialogTitle>
                                                <DialogDescription className="mb-2">
                                                    Prescribed by Dr. {prescription.doctorName || 'Doctor'} on {formatDate(prescription.date)}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="mb-4">
                                                <p className="text-base font-medium mb-2">Details</p>
                                                <p className="whitespace-pre-line text-slate-700 mb-2">{prescription.details}</p>
                                                <Badge
                                                    variant={prescription.status === 'Active' ? 'default' : 'secondary'}
                                                    className={`text-xs ${prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    {prescription.status}
                                                </Badge>
                                            </div>
                                            <DialogFooter>
                                                {prescription.status === 'Active' && (
                                                    <Button
                                                        variant="outline"
                                                        className="text-yellow-700 border-yellow-400 hover:bg-yellow-100 flex items-center gap-2"
                                                        disabled={actionLoading}
                                                        onClick={async () => {
                                                            setActionLoading(true);
                                                            try {
                                                                const res = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription/${prescription._id}`, {
                                                                    method: 'PUT',
                                                                    headers: {
                                                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                        'Content-Type': 'application/json',
                                                                    },
                                                                    body: JSON.stringify({ status: 'Completed' })
                                                                });
                                                                if (!res.ok) throw new Error('Failed to deactivate');
                                                                setSelected(null);
                                                                const response = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription`, {
                                                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                                                });
                                                                const data = await response.json();
                                                                setPrescriptions(data.data || []);
                                                            } catch (err) {
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
                                                            const res = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription/${prescription._id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                                            });
                                                            if (!res.ok) throw new Error('Failed to delete');
                                                            setSelected(null);
                                                            const response = await fetch(`${import.meta.env.VITE_Backend_URL}/prescription`, {
                                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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

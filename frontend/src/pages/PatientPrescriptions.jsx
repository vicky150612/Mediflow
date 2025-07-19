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
    Loader2
} from "lucide-react";

const PatientPrescriptions = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                                    <div
                                        key={index}
                                        className="flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 group"
                                    >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                                                <Pill className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 mb-1 leading-tight">
                                                    {prescription.prescription}
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
                                            variant="outline"
                                            className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            Active
                                        </Badge>
                                    </div>
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

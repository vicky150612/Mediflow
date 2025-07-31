import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    FileText,
    Upload,
    Trash2,
    ExternalLink,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Plus,
    CheckCircle,
    Image
} from "lucide-react";

import "../index.css";

const PatientFiles = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filename, setFilename] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchFiles = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/patient/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            const data = await response.json();
            setFiles(data.data || []);
        } catch (error) {
            console.error('Error fetching files:', error);
            if (error.message === 'Failed to fetch files') {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    }, [backendUrl, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchFiles();
    }, [backendUrl, navigate, fetchFiles]);

    const handleFileChange = (e) => {
        setUploadedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        setDisabled(true);
        e.preventDefault();
        if (!uploadedFile || !filename) return;

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('filename', filename);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error('Upload failed');
            }
            setUploadMessage('File uploaded successfully!');
            setShowModal(false);
            await fetchFiles();
            setFilename('');
            setUploadedFile(null);
        } catch (err) {
            setUploadMessage('Upload failed: ' + err.message);
        }
        setDisabled(false);
    };

    const handleDelete = async (fileId) => {
        setDeletingId(fileId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${backendUrl}/patient/file/${fileId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error('Delete failed');
            }
            await fetchFiles();
        } catch (err) {
            console.error('Error deleting file:', err);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
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
                        <h1 className="text-xl font-bold">Medical Reports</h1>
                        <p className="text-sm text-muted-foreground">View and manage your reports</p>
                    </div>
                </div>

                <Card className="bg-card text-foreground border border-border">
                    <CardContent className="pt-4">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="w-full gap-2"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            Upload New Report
                        </Button>

                        {uploadMessage && (
                            <Alert
                                variant={uploadMessage.includes('success') ? "default" : "destructive"}
                                className="mt-3"
                            >
                                {uploadMessage.includes('success') ? (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                                <AlertDescription className="text-sm">{uploadMessage}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card text-foreground border border-border">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Your Reports
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {files.length} file{files.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {files.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No reports uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {files.map(file => (
                                    <div
                                        key={file._id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted group transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate select-text">
                                                    {file.filename}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(file.url, '_blank')}
                                                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(file._id)}
                                                disabled={deletingId === file._id}
                                                className="h-8 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors"
                                            >
                                                {deletingId === file._id ? (
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

                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
                        <DialogHeader>
                            <DialogTitle className="text-base flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Report
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="filename" className="text-sm">File Name</Label>
                                <Input
                                    id="filename"
                                    value={filename}
                                    onChange={e => setFilename(e.target.value)}
                                    placeholder="Enter report name"
                                    required
                                    disabled={disabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file" className="text-sm">Choose File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    required
                                    disabled={disabled}
                                    className="file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-muted file:text-foreground hover:file:bg-muted/80"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setUploadMessage('');
                                    }}
                                    disabled={disabled}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={disabled || !filename || !uploadedFile}
                                    className="flex-1 gap-2"
                                >
                                    {disabled ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    Upload
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default PatientFiles;

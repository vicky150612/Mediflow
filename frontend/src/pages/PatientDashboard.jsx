import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    FileText,
    Users,
    Pill,
    LogOut,
    User,
    Mail,
    Hash,
    Activity,
    Loader2,
    Bot
} from "lucide-react";
import { ModeToggle } from "@/components/Toggle";
import "../index.css";


const PatientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`${import.meta.env.VITE_Backend_URL}/me`, {
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
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!profile)
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage your health records and appointments</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <Button variant="outline" onClick={() => navigate('/profile')} className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                <Card className="bg-card text-foreground border border-border">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate('/profile')}>
                                <AvatarFallback className="bg-muted text-primary text-lg">
                                    {profile.name[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">Welcome back, {profile.name.split(' ')[0]}!</CardTitle>
                                <Badge variant="secondary" className="mt-1">
                                    <Activity className="h-3 w-3 mr-1" />
                                    Active Patient
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium text-foreground">{profile.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium text-foreground">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Patient ID</p>
                                    <p className="font-medium text-foreground">{profile.id}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                        className="hover:shadow-md transition-shadow cursor-pointer bg-card border border-border"
                        onClick={() => navigate('/files')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Medical Reports</h3>
                                    <p className="text-sm text-muted-foreground">View your test results</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:shadow-md transition-shadow cursor-pointer bg-card border border-border"
                        onClick={() => navigate('/accesslist')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Access Control</h3>
                                    <p className="text-sm text-muted-foreground">Manage data permissions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:shadow-md transition-shadow cursor-pointer bg-card border border-border"
                        onClick={() => navigate('/prescriptions')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Prescriptions</h3>
                                    <p className="text-sm text-muted-foreground">View medications</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="hover:shadow-md transition-shadow cursor-pointer bg-card border border-border md:col-start-2"
                        onClick={() => navigate('/ai')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">AI Chat</h3>
                                    <p className="text-sm text-muted-foreground">Chat with AI</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

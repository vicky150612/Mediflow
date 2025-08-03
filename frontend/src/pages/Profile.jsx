import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Shield, UserCheck, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [receptionistId, setReceptionistId] = useState('');
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_Backend_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${backendUrl}/me`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok) throw new Error('Could not fetch profile');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [backendUrl]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;

        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');

        try {
            const res = await fetch(`${backendUrl}/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Delete failed');

            setDeleteSuccess('Profile deleted. Redirecting...');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/signup'), 1500);
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete profile.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangeReceptionist = async () => {
        if (!receptionistId.trim()) {
            setUpdateError('Please enter a receptionist ID');
            return;
        }

        setUpdateLoading(true);
        setUpdateError('');
        setUpdateSuccess('');

        try {
            const res = await fetch(`${backendUrl}/doctor/receptionist`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receptionistId: receptionistId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Update failed');

            setUpdateSuccess('Receptionist updated successfully!');
            setReceptionistId('');

            // Refresh profile data
            const profileRes = await fetch(`${backendUrl}/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (profileRes.ok) {
                const updatedProfile = await profileRes.json();
                setProfile(updatedProfile);
            }
        } catch (err) {
            setUpdateError(err.message || 'Failed to update receptionist.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'doctor': return 'bg-blue-100 text-blue-800';
            case 'patient': return 'bg-green-100 text-green-800';
            case 'receptionist': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Profile
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : profile && (
                        <>
                            {/* Profile Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                        <p className="text-sm font-semibold">{profile.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <p className="text-sm font-semibold">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                                        <p className="text-sm font-semibold break-all">{profile.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                                        <Badge className={`${getRoleColor(profile.role)} mt-1`}>
                                            {profile.role}
                                        </Badge>
                                    </div>
                                </div>

                                {profile.registrationNumber && (
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                                            <p className="text-sm font-semibold">{profile.registrationNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Doctor Receptionist Section */}
                            {profile.role === 'doctor' && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Current Receptionist</Label>
                                                <p className="text-sm font-semibold">
                                                    {profile.receptionist || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="receptionistId">Change Receptionist</Label>
                                            <Input
                                                id="receptionistId"
                                                type="text"
                                                placeholder="Enter Receptionist ID"
                                                value={receptionistId}
                                                onChange={(e) => setReceptionistId(e.target.value)}
                                                disabled={updateLoading}
                                            />
                                            <Button
                                                onClick={handleChangeReceptionist}
                                                className="w-full"
                                                disabled={updateLoading || !receptionistId.trim()}
                                            >
                                                {updateLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Update Receptionist'
                                                )}
                                            </Button>
                                        </div>

                                        {updateError && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{updateError}</AlertDescription>
                                            </Alert>
                                        )}
                                        {updateSuccess && (
                                            <Alert className="border-green-200 bg-green-50">
                                                <AlertDescription className="text-green-800">
                                                    {updateSuccess}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </CardContent>

                {profile && (
                    <CardFooter className="flex flex-col gap-3 pt-6 border-t">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Profile'
                            )}
                        </Button>

                        {deleteError && (
                            <Alert variant="destructive">
                                <AlertDescription>{deleteError}</AlertDescription>
                            </Alert>
                        )}
                        {deleteSuccess && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">
                                    {deleteSuccess}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default Profile;

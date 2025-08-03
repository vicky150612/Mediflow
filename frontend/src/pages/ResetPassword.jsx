import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sending, setSending] = useState(false);

    const sendResetCode = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setSending(true);
        try {
            const res = await fetch(`${backendUrl}/login/reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send code');
            setSuccess('Code sent! Check your email.');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setSending(true);
        try {
            const res = await fetch(`${backendUrl}/login/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to reset password');
            setSuccess('Password reset! You can now log in.');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
            <Card className="w-full max-w-md p-8 flex flex-col gap-6 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    </div>
                    <CardDescription>Get back into your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={sendResetCode} className="flex flex-col gap-4">
                            <label className="font-medium">Email</label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" />
                            <Button type="submit" className="w-full" disabled={sending}>{sending ? 'Sending...' : 'Send Code'}</Button>
                        </form>
                    )}
                    {step === 2 && (
                        <form onSubmit={handleReset} className="flex flex-col gap-4">
                            <label className="font-medium">6-digit Code</label>
                            <Input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} required placeholder="Enter code" />
                            <label className="font-medium">New Password</label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="New password" />
                            <Button type="submit" className="w-full" disabled={sending}>{sending ? 'Resetting...' : 'Reset Password'}</Button>
                        </form>
                    )}
                    {step === 3 && (
                        <div className="text-center text-green-700">Password reset! You can now log in.</div>
                    )}
                </CardContent>
                {(error || success) && (
                    <CardFooter className="p-0">
                        {error && <p className="w-full text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">{error}</p>}
                        {success && <p className="w-full text-center text-sm text-green-700 bg-green-100 border border-green-200 rounded p-2">{success}</p>}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default ResetPassword;

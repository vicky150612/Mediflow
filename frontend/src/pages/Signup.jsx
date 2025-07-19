import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import "../index.css";
import emailjs from '@emailjs/browser';

emailjs.init({
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    limitRate: {
        id: 'app',
        throttle: 10000,
    },
});

const Signup = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Two-step verification state
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [inputCode, setInputCode] = useState('');
    const [verificationCode, setVerificationCode] = useState(null);
    const [sending, setSending] = useState(false);

    const sendEmail = async (email, code) => {
        try {
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    email: email,
                    passcode: code,
                }
            );
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSending(true);

        const formDataObj = new FormData(e.target);
        const data = Object.fromEntries(formDataObj.entries());
        data.role = role;
        if (role !== 'doctor') delete data.registrationNumber;

        const code = Math.floor(Math.random() * 900000) + 100000;

        try {
            await sendEmail(data.email, code);
            setVerificationCode(code);
            setFormData(data);
            setStep(2);
        } catch (err) {
            setError('Failed to send verification email.');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (inputCode !== verificationCode?.toString()) {
            setError('Invalid verification code');
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess('Signup successful! Please login.');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                const result = await res.json();
                setError(result.message || 'Signup failed');
            }
        } catch (err) {
            setError('Network error' + (err.message ? `: ${err.message}` : ''));
        }
    };

    const resendCode = async () => {
        setError('');
        setSuccess('');
        setSending(true);

        try {
            await sendEmail(formData.email, verificationCode);
            setSuccess('Verification code resent.');
        } catch {
            setError('Failed to resend code.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
            <Card className="w-full max-w-md p-8 flex flex-col gap-6 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>Sign up to get started with Mediflow</CardDescription>
                </CardHeader>

                {step === 1 && (
                    <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                        <div className="flex gap-4 mb-2 flex-wrap justify-center">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="patient"
                                    checked={role === 'patient'}
                                    onChange={() => setRole('patient')}
                                    className="accent-indigo-600 mr-2"
                                />
                                <span className="text-gray-700">Patient</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="doctor"
                                    checked={role === 'doctor'}
                                    onChange={() => setRole('doctor')}
                                    className="accent-indigo-600 mr-2"
                                />
                                <span className="text-gray-700">Doctor</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="receptionist"
                                    checked={role === 'receptionist'}
                                    onChange={() => setRole('receptionist')}
                                    className="accent-indigo-600 mr-2"
                                />
                                <span className="text-gray-700">Receptionist</span>
                            </label>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="name" className="font-medium">Name</label>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="Your Name"
                                autoComplete="name"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="font-medium">Email</label>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                required
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        {role === 'doctor' && (
                            <div className="flex flex-col gap-1">
                                <label htmlFor="registrationNumber" className="font-medium">Registration Number</label>
                                <Input
                                    type="text"
                                    name="registrationNumber"
                                    id="registrationNumber"
                                    required={role === 'doctor'}
                                    placeholder="Doctor Reg. No."
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="font-medium">Password</label>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                required
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={sending}>
                            {sending ? 'Sending code...' : 'Signup'}
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <CardContent className="p-0">
                        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 items-center">
                                <label htmlFor="verificationCode" className="font-medium text-center">
                                    Enter Verification Code
                                </label>
                                <p className="text-sm text-muted-foreground text-center">
                                    We've sent a 6-digit code to {formData.email}
                                </p>

                                <InputOTP
                                    maxLength={6}
                                    value={inputCode}
                                    onChange={(value) => setInputCode(value)}
                                    className="justify-center"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={inputCode.length !== 6}
                            >
                                Verify & Register
                            </Button>

                            <Button
                                type="button"
                                variant="link"
                                className="text-indigo-600 underline text-sm mt-1 px-0"
                                onClick={resendCode}
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Resend Code'}
                            </Button>
                        </form>
                    </CardContent>
                )}

                {(error || success) && (
                    <CardFooter className="p-0">
                        {error && (
                            <p className="w-full text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="w-full text-center text-sm text-green-700 bg-green-100 border border-green-200 rounded p-2">
                                {success}
                            </p>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default Signup;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "../index.css";


const Login = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            const res = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const result = await res.json();
                if (result.token) {
                    localStorage.setItem('token', result.token);
                    navigate('/dashboard');
                }
            } else {
                const result = await res.json();
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
            console.error('Network error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
            <Card className="w-full max-w-md p-8 flex flex-col gap-6 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Login to your Mediflow account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="font-medium">Password</label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                </form>
                {error && (
                    <CardFooter className="p-0">
                        <p className="w-full text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">{error}</p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default Login;
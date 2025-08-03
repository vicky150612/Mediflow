import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CompleteProfile = () => {
  const backendUrl = import.meta.env.VITE_Backend_URL;
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');
      const res = await fetch(`${backendUrl}/auth/google/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, registrationNumber: regNo, username }),
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem('token', result.token);
        navigate('/dashboard');
      } else {
        const result = await res.json();
        setError(result.message || 'Profile completion failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Select your role to finish signup</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4 mb-2 flex-wrap justify-center">
              {['patient', 'doctor', 'receptionist'].map((r) => (
                <label key={r} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="accent-indigo-600 mr-2"
                  />
                  <span className="text-gray-700 capitalize">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="font-medium">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username"
              />
            </div>
            {role === 'doctor' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="regNo" className="font-medium">Registration Number</label>
                <Input
                  id="regNo"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  required
                  placeholder="Doctor Reg. No."
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? 'Saving…' : 'Finish'}
            </Button>
          </form>
        </CardContent>
        {error && (
          <CardFooter className="p-0">
            <p className="w-full text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
              {error}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CompleteProfile;

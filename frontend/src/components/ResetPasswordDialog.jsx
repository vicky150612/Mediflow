import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ResetPasswordSection({ email, onReset }) {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [sent, setSent] = useState(false);
    const backendUrl = import.meta.env.VITE_Backend_URL;

    const handleSendCode = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${backendUrl}/login/reset-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send code");
            setSent(true);
            setSuccess("Code sent to your email");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${backendUrl}/login/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Reset failed");
            setSuccess("Password reset successful!");
            setCode("");
            setNewPassword("");
            setConfirmPassword("");
            setSent(false);
            if (onReset) onReset();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {!sent && <div className="flex gap-2">
                <Input
                    type="email"
                    value={email}
                    disabled
                    className="w-full"
                />
                <Button onClick={handleSendCode} disabled={loading || sent} type="button">
                    {loading && !sent ? "Sending..." : sent ? "Code Sent" : "Send Code"}
                </Button>
            </div>}
            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {sent && (
                <form onSubmit={handleReset} className="space-y-3">
                    <Input
                        type="text"
                        placeholder="Enter code from email"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordDialog({ email }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Reset Password</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <ResetPasswordSection email={email} onReset={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

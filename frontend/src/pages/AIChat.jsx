import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ArrowLeft,
    Send,
    Loader2,
    AlertCircle,
    MessageSquare
} from "lucide-react";

const AIChat = () => {
    const backendUrl = import.meta.env.VITE_Backend_URL;
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            role: "ai",
            text: "Hi! 👋 I'm your prescription assistant. Ask me anything about your medications."
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const scrollAreaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest"
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        setError("");
        const userMessage = input.trim();
        const newMsgs = [...messages, { role: "user", text: userMessage }];
        setMessages(newMsgs);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${backendUrl}/ai/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ text: userMessage })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to get AI response");
            }

            setMessages(prev => [...prev, { role: "ai", text: data.text }]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 text-foreground">
            <div className="max-w-2xl mx-auto h-[calc(100vh-2rem)] flex flex-col space-y-4">
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
                        <h1 className="text-xl font-bold">AI Assistant</h1>
                        <p className="text-sm text-muted-foreground">Ask about your medications</p>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col min-h-0 bg-card text-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                            {loading && (
                                <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Typing...
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                        <ScrollArea
                            ref={scrollAreaRef}
                            className="flex-1 px-4 min-h-0"
                        >
                            <div className="space-y-3 py-2">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`
                        max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap
                        ${message.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground"
                                                }
                      `}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        </ScrollArea>

                        {error && (
                            <div className="px-4 pb-2">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <div className="border-t border-border p-3">
                            <div className="flex gap-2">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about medications, side effects..."
                                    className="resize-none min-h-[40px] max-h-24 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-md px-3 py-2"
                                    disabled={loading}
                                    rows={1}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={loading || !input.trim()}
                                    size="sm"
                                    className="px-3 self-end"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-1">
                                Press Enter to send • Shift+Enter for new line
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AIChat;

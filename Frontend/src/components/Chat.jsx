import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Data Assistant. Ask me anything about the sales data.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const refreshChat = () => {
        setMessages([
            { id: 1, text: "Hello! I'm your Data Assistant. Ask me anything about the sales data.", sender: 'bot' }
        ]);
        setInput('');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Use absolute path for Power BI / Embedded compatibility
            const response = await axios.post('https://chat-bot-rsutra.vercel.app/chat', { question: input });

            const botMessage = {
                id: Date.now() + 1,
                text: response.data.answer,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I encountered network error. Please ensure the backend is running.",
                sender: 'bot',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-md border-b border-gray-700 shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg shadow-indigo-500/20 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Sales Data Assistant - ChatBotrSutra
                    </h1>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start max-w-3xl gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                    ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                    {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div
                                    className={`p-4 rounded-2xl shadow-md text-sm md:text-base leading-relaxed
                                    ${msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                                            : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm'
                                        } ${msg.isError ? 'bg-red-900/50 border-red-700 text-red-200' : ''}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-700 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                <span className="text-gray-400 text-sm">Thinking...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-700">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refreshChat}
                        className="p-4 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 
                                   border border-gray-700 rounded-xl transition-all shadow-md group"
                        title="Reset Chat"
                    >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about sales, revenue, or trends..."
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-5 py-4 pr-14 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                                   transition-all shadow-inner"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed
                                   text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-gray-500">
                    All rights reserved © ChatBotrSutra
                </div>
            </div>
        </div>
    );
};

export default Chat;

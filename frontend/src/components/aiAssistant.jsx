import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Check, Loader2, Bot, User, Hospital } from 'lucide-react';
import { AI_WORKFLOW_STEPS, getAIResponse } from '../data';
import { setField, setMultipleFields } from '../redux/interactionSlice'
import { useSelector, useDispatch } from "react-redux";


const SUGGESTED_PROMPTS = [
    "Log today's visit",
    "Show Dr. Sarah's history",
    'Schedule follow-up',
    'Summarize last interaction',
];

export default function AIAssistant({ onAIExtract }) {
    const dispatch = useDispatch();
    const {
        hcpName,
        interactionType,
        hospital,
        specialty,
        date,
        time,
        attendees,
        topics,
        materialsShared,
        samplesDistributed,
        sentiment,
        outcomes,
        followUp,
        followUpDate,
    } = useSelector((state) => state.interaction);

    const [messages, setMessages] = useState([
        {
            id: 'init',
            role: 'ai',
            content: "Hi Alex! I'm your AI assistant. Describe your HCP interaction in natural language and I'll auto-fill the form for you. Try a suggested prompt below.",
        },
    ]);
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [visibleSteps, setVisibleSteps] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, processing, visibleSteps]);

    const handleSubmit = async (promptText) => {
        const text = (promptText ?? input).trim();
        if (!text || processing) return;

        setInput('');
        const userMsg = { id: `u${Date.now()}`, role: 'user', content: text };
        setMessages((m) => [...m, userMsg]);
        setProcessing(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/autofill", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    current_data: {
                        hcp_name: hcpName,
                        interaction_type: interactionType,
                        date: date,
                        time: time,
                        attendees: attendees,
                        topics_discussed: topics,
                        materials_shared: materialsShared,
                        samples_distributed: samplesDistributed,
                        sentiment: sentiment,
                        outcomes: outcomes,
                        follow_up: followUp,
                    },
                }),
            });

            if (!response.ok) throw new Error(`Server responded ${response.status}`);

            const data = await response.json();
            const aiData = JSON.parse(data.result);

            dispatch(setMultipleFields({
                hcpName: aiData.hcp_name,
                interactionType: aiData.interaction_type,
                hospital : aiData.hospital,
                specialty: aiData.specialty,
                date: aiData.date,
                time: aiData.time,
                attendees: aiData.attendees,
                topics: aiData.topics_discussed,
                materialsShared: aiData.materials_shared,
                samplesDistributed: aiData.samples_distributed,
                sentiment: aiData.sentiment,
                outcomes: aiData.outcomes,
                followUp: aiData.follow_up,
                followUpDate: aiData.follow_up_date
            }));

            const aiMsg = { id: `a${Date.now()}`, role: 'ai', content: data.reply };
            setMessages((m) => [...m, aiMsg]);
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error("Autofill error:", error);
            const errorMsg = { id: `err${Date.now()}`, role: 'ai', content: "Sorry, something went wrong processing that." };
            setMessages((m) => [...m, errorMsg]);
        } finally {
            setProcessing(false);
        }
    };

    const handleApplySuggestion = (suggestion) => {
        dispatch(setField({ field: "followUp", value: suggestion }));
    };
    return (
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md">
                    <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-teal-400 ring-2 ring-white" />
                </div>
                <div>
                    <h2 className="text-[15px] font-bold text-slate-900">AI Assistant</h2>
                    <p className="text-[12px] font-medium text-teal-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
                        Online · Ready to log
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${msg.role === 'ai' ? 'bg-primary-600' : 'bg-slate-200'}`}>
                            {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4 text-slate-600" />}
                        </div>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block text-left rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${msg.role === 'user'
                                ? 'bg-primary-600  rounded-tr-md'
                                : 'bg-slate-50 text-slate-700 rounded-tl-md border border-slate-100'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {processing && (
                    <div className="flex gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                            <Bot className="h-4 w-4 text-black" />
                        </div>
                        <div className="inline-block rounded-2xl rounded-tl-md border border-slate-100 bg-slate-50 px-4 py-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                        </div>
                    </div>
                )}
            </div>
            {/* Suggested prompts */}
            {messages.length <= 1 && !processing && (
                <div className="px-5 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Suggested prompts</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_PROMPTS.map((p) => (
                            <button
                                key={p}
                                onClick={() => handleSubmit(p)}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-100 p-4">
                <div className="relative flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        rows={1}
                        placeholder="Describe your HCP interaction..."
                        className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none"
                        disabled={processing}
                    />
                    <button
                        onClick={() => handleSubmit()}
                        disabled={!input.trim() || processing}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Send className="h-4 w-4 text-black" strokeWidth={2} />
                    </button>
                </div>
                <p className="mt-2 px-1 text-[11px] text-slate-400">AI may produce inaccurate info. Verify before saving.</p>
            </div>
        </div>
    );
}
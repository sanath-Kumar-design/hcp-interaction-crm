import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Building2, Stethoscope, Plus } from 'lucide-react';

const AVATAR_COLORS = [
    'bg-fuchsia-600',
    'bg-rose-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-blue-600',
    'bg-amber-600',
];

function avatarColor(name) {
    const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name) {
    return name
        .replace(/^Dr\.?\s*/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function HcpDetail({ hcpName, onBack, onLogInteraction }) {
    const [hcp, setHcp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch(`http://localhost:8000/hcps/${encodeURIComponent(hcpName)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load HCP details');
                return res.json();
            })
            .then((data) => setHcp(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [hcpName]);

    return (
        <div className="mx-auto max-w-5xl">
            {/* Back */}
            <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to directory
            </button>

            {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
                    <p className="text-[13px] font-medium text-slate-400">Loading…</p>
                </div>
            ) : error || !hcp ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 p-16 text-center">
                    <p className="text-[14px] font-semibold text-rose-700">Couldn't load this HCP</p>
                    <p className="mt-1 text-[12px] font-medium text-rose-400">{error}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${avatarColor(
                                    hcp.hcpName,
                                )} text-[20px] font-semibold text-white shadow-soft`}
                            >
                                {initials(hcp.hcpName)}
                            </div>
                            <div>
                                <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
                                    {hcp.hcpName}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                        {hcp.hospital}
                                    </span>
                                    {hcp.specialty && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-inset ring-primary-100">
                                            <Stethoscope className="h-3 w-3" />
                                            {hcp.specialty}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onLogInteraction(hcp.hcpName)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                        >
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            Log new interaction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
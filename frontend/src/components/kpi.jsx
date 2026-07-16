import { CalendarCheck, Clock, Smile, Pill } from 'lucide-react';
import { useEffect, useState } from 'react';

const COLOR_MAP = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
};

export default function KpiCards() {
    const [kpiData, setKpiData] = useState(null);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/kpis", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();
                setKpiData(data);
            } catch (err) {
                console.error("Failed to fetch KPIs:", err);
            }
        };

        fetchKpis();
    }, []);

    const cards = [
        {
            label: "Today's Visits",
            value: kpiData?.todaysVisits.value ?? '—',
            sub: kpiData?.todaysVisits.sub ?? '',
            icon: CalendarCheck, color: 'primary', trend: '+2 vs avg',
        },
        {
            label: 'Pending Follow-ups',
            value: kpiData?.pendingFollowups.value ?? '—',
            sub: 'Due this week',
            icon: Clock, color: 'amber',
            trend: kpiData ? `${kpiData.pendingFollowups.overdue} overdue` : '',
        },
        {
            label: 'Positive Interactions',
            value: kpiData?.positiveInteractions.value ?? '—',
            sub: 'Last 30 days',
            icon: Smile, color: 'teal', trend: '+5% MoM',
        },
        {
            label: 'Samples Distributed',
            value: kpiData?.samplesDistributed.value ?? '—',
            sub: 'This month',
            icon: Pill, color: 'rose', trend: '+18 units',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                const c = COLOR_MAP[card.color];
                return (
                    <div
                        key={card.label}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:shadow-card hover:border-slate-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ring-1 ${c.ring}`}>
                                <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={2} />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">{card.trend}</span>
                        </div>
                        <p className="mt-3 text-[26px] font-bold leading-none tracking-tight text-slate-900">{card.value}</p>
                        <p className="mt-1.5 text-[13px] font-medium text-slate-600">{card.label}</p>
                        <p className="text-[11px] text-slate-400">{card.sub}</p>
                    </div>
                );
            })}
        </div>
    );
}
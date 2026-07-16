import { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Bell, Search as SearchIcon } from 'lucide-react';
import FilterBar from './FilterBar.jsx';
import HcpCard from './hcpCard';
import HcpDetail from './hcpDetail.jsx';

export default function DirectoryPage({ onNavigate }) {
    console.log("DirectoryPage rendered");
    const [hcps, setHcps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [query, setQuery] = useState('');
    const [specialty, setSpecialty] = useState('all');
    const [selectedName, setSelectedName] = useState(null);

    useEffect(() => {
        console.log("Fetching HCPs...");
         console.log("DirectoryPage mounted");

        setIsLoading(true);
        setError(null);

        fetch("http://localhost:8000/hcps", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                console.log("Response:", res.status);
                if (!res.ok) throw new Error("Failed to load HCPs");
                return res.json();
            })
            .then((data) => {
                console.log(data);
                setHcps(data);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return hcps.filter((h) => {
            const matchesQuery =
                q === '' ||
                h.hcpName.toLowerCase().includes(q) ||
                h.hospital.toLowerCase().includes(q);
            const matchesSpecialty = specialty === 'all' || h.specialty === specialty;
            return matchesQuery && matchesSpecialty;
        });
    }, [query, specialty, hcps]);

    if (selectedName) {
        return (
            <HcpDetail
                hcpName={selectedName}
                onBack={() => setSelectedName(null)}
                onLogInteraction={() => onNavigate('interactions')}
            />
        );
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <Users className="h-4 w-4" strokeWidth={2.25} />
                        </div>
                        <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
                            HCP Directory
                        </h1>
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium text-slate-500">
                        Browse and manage your healthcare professional relationships.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 shadow-soft transition-colors hover:bg-slate-50">
                        <Bell className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        onClick={() => onNavigate('interactions')}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all hover:bg-primary-700 hover:shadow-card"
                    >
                        <UserPlus className="h-4 w-4" strokeWidth={2.25} />
                        Add HCP
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="mb-5">
                <FilterBar
                    hcps={hcps}
                    query={query}
                    onQueryChange={setQuery}
                    specialty={specialty}
                    onSpecialtyChange={setSpecialty}
                    resultCount={filtered.length}
                />
            </div>

            {/* Loading / error / empty / grid states */}
            {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
                    <p className="text-[13px] font-medium text-slate-400">Loading HCPs…</p>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 p-16 text-center">
                    <p className="text-[14px] font-semibold text-rose-700">Couldn't load HCPs</p>
                    <p className="mt-1 text-[12px] font-medium text-rose-400">{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-700">No HCPs found</p>
                    <p className="mt-1 text-[12px] font-medium text-slate-400">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((hcp) => (
                        <HcpCard
                            key={hcp.hcpName}
                            hcp={hcp}
                            onClick={() => setSelectedName(hcp.hcpName)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
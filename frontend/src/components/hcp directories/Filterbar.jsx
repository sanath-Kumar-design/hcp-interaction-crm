import { useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function FilterBar({
  hcps,
  query,
  onQueryChange,
  specialty,
  onSpecialtyChange,
  resultCount,
}) {
  const hasFilters = query !== '' || specialty !== 'all';

  const specialties = useMemo(() => {
    const set = new Set(hcps.map((h) => h.specialty).filter(Boolean));
    return [...set].sort();
  }, [hcps]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by HCP name or hospital…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Specialty filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={specialty}
              onChange={(e) => onSpecialtyChange(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-[13px] font-medium text-slate-700 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="all">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-[12px] font-medium text-slate-500">
          <span className="font-semibold text-slate-900">{resultCount}</span>{' '}
          {resultCount === 1 ? 'HCP' : 'HCPs'} found
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              onQueryChange('');
              onSpecialtyChange('all');
            }}
            className="text-[12px] font-semibold text-primary-600 hover:text-primary-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
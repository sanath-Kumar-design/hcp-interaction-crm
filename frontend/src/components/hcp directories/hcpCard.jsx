import { ArrowUpRight, MapPin } from 'lucide-react';

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

export default function HcpCard({ hcp, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      {/* Header: avatar + name */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3  ">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${avatarColor(
              hcp.hcpName,
            )} text-[14px] font-semibold text-white shadow-soft`}
          >
            {initials(hcp.hcpName)}
          </div>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-tight text-slate-900">
              {hcp.hcpName}
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-500" />
      </div>

      {/* Hospital */}
      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
        <MapPin className="h-3.5 w-3.5 text-slate-400" />
        <span className="truncate">{hcp.hospital || "Hospital not "}</span>
      </div>

      {/* Specialty pill */}
      <div className="mt-3">
        <span className="inline-flex items-center rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-inset ring-primary-100">
          {hcp.specialty || "---"}
        </span>
      </div>
      {hcp.sentiment && (
        <div className='border-t mt-5'>
          <span className="inline-flex items-center  bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ">
            {hcp.sentiment}
          </span>
        </div>
      )}



    </button>
  );
}
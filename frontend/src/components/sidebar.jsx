import {
  LayoutDashboard, Users, MessageSquare, CheckSquare,
  Calendar, BarChart3, Settings, Stethoscope,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'directory', label: 'HCP Directory', icon: Users },
  { id: 'interactions', label: 'Interactions', icon: MessageSquare },
  { id: 'followups', label: 'Follow-ups', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <Stethoscope className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-slate-900">MediSync</p>
          <p className="text-[11px] font-medium text-slate-400 -mt-0.5">Healthcare CRM</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                strokeWidth={2}
              />
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
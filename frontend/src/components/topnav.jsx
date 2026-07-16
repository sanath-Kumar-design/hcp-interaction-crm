import { useSelector } from "react-redux";
import { Search, Bell, ChevronDown, HelpCircle } from 'lucide-react';



export default function Topnav() {
  const user = useSelector((state) => state.auth.user);
  console.log("username is", user ? user.username : "")
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search HCPs, interactions, samples..."
          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <div className="ml-2 flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-100 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-[12px] font-bold text-white">
            AK
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-semibold leading-tight text-slate-800">{user?.username}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
import { useState, useEffect } from 'react';
import { HCP_LIST } from '../data';
import { History, CalendarClock, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';

const SENTIMENT_DOT = {
  Positive: 'bg-teal-500',
  Neutral: 'bg-slate-400',
  Skeptical: 'bg-amber-500',
  Negative: 'bg-rose-500',
};

export default function ContextSidebar() {
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/recommendations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        const data = await res.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };
    fetchRecommendations();
  }, []);


  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/interactions/recent?limit=3", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        const data = await res.json();
        setRecentInteractions(data);
      } catch (err) {
        console.error("Failed to fetch recent interactions:", err);
      }
    };
    fetchRecent();
  }, []);

  // TODO: wire these up to real endpoints — currently empty so the component doesn't crash
  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/interactions/upcoming-followups", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        const data = await res.json();
        setUpcomingFollowUps(data);
      } catch (err) {
        console.error("Failed to fetch upcoming follow-ups:", err);
      }
    };
    fetchFollowUps();
  }, []);
  const stats = [];

  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col gap-4 overflow-y-auto scrollbar-thin">
      {/* Recent Interactions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-primary-600" />
          <h3 className="text-[13px] font-bold text-slate-800">Recent Interactions</h3>
        </div>
        <div className="space-y-3">
          {recentInteractions.map((i) => (
            <div key={i.id} className="group cursor-pointer rounded-xl border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/30">
              <p className="text-[12.5px] font-semibold text-slate-700 truncate">{i.hcpName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{i.interactionType} · {i.date}</p>
              <p className="text-[11.5px] text-slate-500 mt-1.5 line-clamp-2">{i.topics}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Follow-ups */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="h-4 w-4 text-amber-500" />
          <h3 className="text-[13px] font-bold text-slate-800">Upcoming Follow-ups</h3>
        </div>
        <div className="space-y-2.5">
          {upcomingFollowUps.length === 0 ? (
            <p className="text-[11.5px] text-slate-400">No upcoming follow-ups.</p>
          ) : (
            upcomingFollowUps.map((f) => (
              <div key={f.id} className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-amber-50">
                  <p className="text-[9px] font-bold text-amber-600 leading-none">{f.followUpDate?.slice(5, 7)}</p>
                  <p className="text-[11px] font-bold text-amber-700 leading-none">{f.followUpDate?.slice(8)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 truncate">{f.followUp}</p>
                  <p className="text-[11px] text-slate-400 truncate text-black">{f.hcpName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/60 to-white p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-600">
            <Lightbulb className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-[13px] font-bold text-slate-800">AI Recommendations</h3>
        </div>
        <div className="space-y-2.5">
          {recommendations.length === 0 ? (
            <p className="text-[11.5px] text-slate-400">No recommendations right now.</p>
          ) : (
            recommendations.map((rec, i) => (
              <div key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-600">
                <span className="text-primary-400 mt-0.5">→</span>
                <p>{rec}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
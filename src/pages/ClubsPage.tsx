import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { Club } from '../types';
import { db } from '../lib/db';

interface ClubsPageProps {
  onNavigate: (route: string) => void;
}

export const ClubsPage: React.FC<ClubsPageProps> = ({ onNavigate }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getClubs().then((data) => {
      setClubs(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const leagues = React.useMemo(() => {
    const set = new Set<string>(['All']);
    clubs.forEach((c) => {
      if (c.league) set.add(c.league);
    });
    return Array.from(set);
  }, [clubs]);

  const filtered = selectedLeague === 'All'
    ? clubs
    : clubs.filter((c) => (c.league || '').toLowerCase() === selectedLeague.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] block">
            Club Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
            SHOP BY CLUB
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Browse official 2026/27 Player Editions and Fan Kits by team
          </p>
        </div>

        {/* League filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {leagues.map((lg) => (
            <button
              key={lg}
              onClick={() => setSelectedLeague(lg)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                selectedLeague === lg
                  ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                  : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
              }`}
            >
              {lg}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-[#E5E5E5]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-[#E5E5E5] text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#111111]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase">No Clubs Found</h3>
            <p className="text-xs text-[#777777] mt-1">
              {selectedLeague === 'All'
                ? 'Clubs are currently being synced with your Supabase database.'
                : `No clubs currently found under ${selectedLeague}.`}
            </p>
          </div>
          {selectedLeague !== 'All' && (
            <button
              onClick={() => setSelectedLeague('All')}
              className="px-5 py-2 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase"
            >
              View All Leagues
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((club) => (
            <button
              key={club.id}
              onClick={() => onNavigate(`shop?club=${club.slug}`)}
              className="p-6 bg-white rounded-3xl border border-[#E5E5E5] hover:border-black hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between group h-52 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-[#888888] uppercase tracking-widest block">
                    {club.league} • {club.country}
                  </span>
                  <h3 className="text-lg font-black text-[#111111] mt-1 group-hover:text-black">
                    {club.name}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#F7F7F5] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-[#F1600D] transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0F0EE] flex items-center justify-between">
                <span className="text-xs font-bold text-[#666666]">
                  2026/27 Drop Available
                </span>
                <span className="text-xs font-black text-[#111111] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>View Kits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

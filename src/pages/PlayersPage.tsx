import React from 'react';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { usePlayers } from '../hooks/useData';

interface PlayersPageProps {
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const PlayersPage: React.FC<PlayersPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { players, loading, error } = usePlayers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] block">
            Squad Superstars
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
            STAR PLAYERS ROSTER
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Choose your superstar or customize your own name & number for official matchday printing
          </p>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="px-5 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors self-start sm:self-auto cursor-pointer"
        >
          Customize Any Kit (+৳250)
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div key={idx} className="h-40 bg-white rounded-3xl animate-pulse border border-[#E5E5E5]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-red-200 text-center text-xs text-red-600">
          {error}
        </div>
      ) : players.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-[#E5E5E5] text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#111111]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111111] uppercase">No Player Rosters Published Yet</h3>
            <p className="text-xs text-[#777777] mt-1">
              Add players to your Supabase `players` table or configure available players inside products.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase"
          >
            Browse All Kits
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => {
                if (player.jersey_slug) {
                  onSelectProduct(player.jersey_slug);
                } else {
                  onNavigate('shop');
                }
              }}
              className="group cursor-pointer bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-6 bg-[#F7F7F5] flex items-center justify-between border-b border-[#E5E5E5]">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#888888] tracking-widest block">
                    {player.club_name || 'Club Kit'}
                  </span>
                  <h3 className="text-lg font-black text-[#111111] mt-0.5">
                    {player.name}
                  </h3>
                </div>
                <div className="text-3xl font-brand font-black text-white group-hover:text-[#F1600D] bg-[#111111] w-12 h-12 rounded-2xl flex items-center justify-center transition-colors">
                  {player.number}
                </div>
              </div>

              <div className="p-5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1.5 text-xs text-[#666666] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Official Heat-Press Vinyl</span>
                </div>
                <span className="text-xs font-black text-[#111111] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>View Kit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

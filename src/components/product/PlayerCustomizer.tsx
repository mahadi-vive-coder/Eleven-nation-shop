import React, { useState } from 'react';
import { Sparkles, Check, User, Hash } from 'lucide-react';
import { PlayerOption } from '../../types';

interface PlayerCustomizerProps {
  availablePlayers: PlayerOption[];
  selectedPlayer: PlayerOption | null;
  customName: string;
  customNumber: string;
  isCustomSelected: boolean;
  onSelectPlayer: (player: PlayerOption | null) => void;
  onUpdateCustomName: (name: string) => void;
  onUpdateCustomNumber: (num: string) => void;
  onToggleCustom: (isCustom: boolean) => void;
  jerseyColor?: string;
}

export const PlayerCustomizer: React.FC<PlayerCustomizerProps> = ({
  availablePlayers = [],
  selectedPlayer,
  customName,
  customNumber,
  isCustomSelected,
  onSelectPlayer,
  onUpdateCustomName,
  onUpdateCustomNumber,
  onToggleCustom,
}) => {
  const [customMode, setCustomMode] = useState<'none' | 'preset' | 'custom'>('none');
  const safePlayers = Array.isArray(availablePlayers) ? availablePlayers : [];

  const handleSelectPreset = (player: PlayerOption) => {
    setCustomMode('preset');
    onToggleCustom(false);
    onSelectPlayer(player);
  };

  const handleChooseCustom = () => {
    setCustomMode('custom');
    onSelectPlayer(null);
    onToggleCustom(true);
  };

  const handleNoPrinting = () => {
    setCustomMode('none');
    onSelectPlayer(null);
    onToggleCustom(false);
    onUpdateCustomName('');
    onUpdateCustomNumber('');
  };

  // Preview text
  const previewName = selectedPlayer?.name || customName || 'ELEVEN';
  const previewNumber = selectedPlayer ? String(selectedPlayer.number) : customNumber || '11';

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F1600D]" />
          <span>Official Heat-Press Printing</span>
        </label>
        <span className="text-[11px] font-bold text-[#666666]">
          {customMode === 'none' ? 'No Printing (৳0)' : '+৳250 BDT'}
        </span>
      </div>

      {/* Mode selection tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleNoPrinting}
          className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border text-center ${
            customMode === 'none'
              ? 'bg-[#111111] text-[#F1600D] border-[#111111] shadow-xs'
              : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
          }`}
        >
          Plain Kit
        </button>

        <button
          type="button"
          onClick={() => {
            if (safePlayers.length > 0) {
              handleSelectPreset(safePlayers[0]);
            } else {
              handleChooseCustom();
            }
          }}
          className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border text-center ${
            customMode === 'preset'
              ? 'bg-[#111111] text-[#F1600D] border-[#111111] shadow-xs'
              : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
          }`}
        >
          Star Player (+৳250)
        </button>

        <button
          type="button"
          onClick={handleChooseCustom}
          className={`py-2 px-1.5 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border text-center ${
            customMode === 'custom'
              ? 'bg-[#111111] text-[#F1600D] border-[#111111] shadow-xs'
              : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
          }`}
        >
          Your Name (+৳250)
        </button>
      </div>

      {/* Preset Player Selector */}
      {customMode === 'preset' && safePlayers.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#777777] uppercase">
            Select Squad Superstar
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {safePlayers.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelectPreset(player)}
                  className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] ring-2 ring-[#F1600D]'
                      : 'bg-white text-[#333333] border-[#E5E5E5] hover:border-black'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <span className="text-xs font-bold block truncate">{player.name}</span>
                    <span className="text-[10px] text-[#888888]">#{player.number}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#F1600D] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Name / Number Inputs */}
      {customMode === 'custom' && (
        <div className="space-y-3 p-3.5 bg-[#F7F7F5] rounded-xl border border-[#E5E5E5]">
          <div className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">
            Personalize Your Kit
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#666666] uppercase block mb-1">
                Name on Back (Max 12 chars)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={12}
                  value={customName}
                  onChange={(e) => onUpdateCustomName(e.target.value.toUpperCase().replace(/[^A-Z\s.]/g, ''))}
                  placeholder="e.g. FAHIM"
                  className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-[#111111] uppercase focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#666666] uppercase block mb-1">
                Number (1-99)
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={customNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 1 && Number(val) <= 99)) {
                      onUpdateCustomNumber(val);
                    }
                  }}
                  placeholder="10"
                  className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-8 pr-2 py-2 text-xs font-bold text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Back Print Preview Mockup */}
      {customMode !== 'none' && (
        <div className="relative bg-[#111111] text-white p-4 rounded-xl flex flex-col items-center justify-center border border-white/10 overflow-hidden shadow-inner">
          <div className="absolute top-2 left-3 text-[9px] font-bold tracking-widest text-[#F1600D] uppercase">
            Live Font Preview (Matchday Pro Spec)
          </div>

          <div className="mt-4 mb-2 text-center select-none">
            <div className="font-display font-extrabold tracking-[0.25em] text-lg sm:text-xl text-[#F7F7F5] uppercase drop-shadow-md">
              {previewName}
            </div>
            <div className="font-brand font-black text-4xl sm:text-5xl text-[#F7F7F5] leading-none tracking-tighter mt-1 drop-shadow-md">
              {previewNumber}
            </div>
          </div>

          <div className="text-[10px] text-[#888888] font-medium">
            Heat-bonded official vinyl with authentic club typography
          </div>
        </div>
      )}
    </div>
  );
};

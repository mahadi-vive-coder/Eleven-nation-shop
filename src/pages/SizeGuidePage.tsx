import React, { useState } from 'react';
import { Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuidePageProps {
  onNavigate: (route: string) => void;
}

export const SizeGuidePage: React.FC<SizeGuidePageProps> = ({ onNavigate }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const sizeChartInches = [
    { size: 'S', chest: '36 - 38"', length: '27"', height: '5\'4" - 5\'7"' },
    { size: 'M', chest: '38 - 40"', length: '28"', height: '5\'7" - 5\'10"' },
    { size: 'L', chest: '40 - 42"', length: '29"', height: '5\'10" - 6\'0"' },
    { size: 'XL', chest: '42 - 44"', length: '30"', height: '6\'0" - 6\'3"' },
    { size: 'XXL', chest: '44 - 46"', length: '31"', height: '6\'2"+' },
  ];

  const sizeChartCm = [
    { size: 'S', chest: '91 - 96 cm', length: '68 cm', height: '162 - 170 cm' },
    { size: 'M', chest: '96 - 101 cm', length: '71 cm', height: '170 - 178 cm' },
    { size: 'L', chest: '101 - 106 cm', length: '74 cm', height: '178 - 183 cm' },
    { size: 'XL', chest: '106 - 112 cm', length: '76 cm', height: '183 - 190 cm' },
    { size: 'XXL', chest: '112 - 118 cm', length: '79 cm', height: '188+ cm' },
  ];

  const chart = unit === 'inches' ? sizeChartInches : sizeChartCm;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] block">
          Fit & Sizing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
          OFFICIAL SIZE GUIDE & FIT SPEC
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-1">
          Precision measurement breakdown for Player Edition, Fan Edition, and Retro Classics
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#666666] uppercase">Measurement Units</span>
          <div className="flex items-center bg-[#F0F0EE] p-1 rounded-xl">
            <button
              onClick={() => setUnit('inches')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                unit === 'inches' ? 'bg-[#111111] text-[#F1600D] shadow-xs' : 'text-[#666666]'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                unit === 'cm' ? 'bg-[#111111] text-[#F1600D] shadow-xs' : 'text-[#666666]'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E5E5E5]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] text-[#111111] font-black uppercase border-b border-[#E5E5E5]">
              <tr>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Chest</th>
                <th className="py-3.5 px-4">Length</th>
                <th className="py-3.5 px-4">Recommended Height</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-[#333333]">
              {chart.map((row) => (
                <tr key={row.size} className="hover:bg-[#F7F7F5] transition-colors">
                  <td className="py-3.5 px-4 font-black text-[#111111]">{row.size}</td>
                  <td className="py-3.5 px-4 font-semibold">{row.chest}</td>
                  <td className="py-3.5 px-4 font-semibold">{row.length}</td>
                  <td className="py-3.5 px-4 text-[#666666]">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#F1600D]" />
              <span>Player Edition Fit Advice</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              Cut slim and athletic for matchday aerodynamics. If you like a relaxed street fit, size UP one size.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#F1600D]" />
              <span>Fan & Retro Fit Advice</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              Standard relaxed straight fit for everyday wear. True to standard Asian / Bangladesh sizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

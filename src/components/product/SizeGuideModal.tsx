import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F5]">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#111111]" />
              <h3 className="text-base font-extrabold text-[#111111]">
                OFFICIAL SIZE GUIDE & FIT SPEC
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#888888] hover:text-[#111111] transition-colors"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Unit Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#666666] uppercase">Measurement Units</span>
              <div className="flex items-center bg-[#F0F0EE] p-1 rounded-lg">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'inches' ? 'bg-[#111111] text-[#F1600D] shadow-xs' : 'text-[#666666]'
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'cm' ? 'bg-[#111111] text-[#F1600D] shadow-xs' : 'text-[#666666]'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#E5E5E5] -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead className="bg-[#F7F7F5] text-[#111111] font-extrabold uppercase border-b border-[#E5E5E5]">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Size</th>
                    <th className="py-3 px-3 sm:px-4">Chest</th>
                    <th className="py-3 px-3 sm:px-4">Length</th>
                    <th className="py-3 px-3 sm:px-4">Suggested Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-[#333333]">
                  {chart.map((row) => (
                    <tr key={row.size} className="hover:bg-[#F7F7F5] transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-extrabold text-[#111111]">{row.size}</td>
                      <td className="py-3 px-3 sm:px-4">{row.chest}</td>
                      <td className="py-3 px-3 sm:px-4">{row.length}</td>
                      <td className="py-3 px-3 sm:px-4 text-[#666666]">{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fit Comparison Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111] uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F1600D]" />
                  <span>Player Edition Cut</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Athletic tapered slim-fit match jersey. <strong>If you prefer a relaxed or loose street fit, we recommend ordering one size up.</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E5E5E5]">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111] uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F1600D]" />
                  <span>Fan / Retro Cut</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Standard relaxed fit designed for everyday streetwear and matchday comfort. True to standard Bangladesh/Asian sizing.
                </p>
              </div>
            </div>

            {/* Free Exchange Note */}
            <div className="p-3 rounded-xl bg-[#111111] text-white text-xs flex items-center justify-between">
              <span>Hassle-Free 7-Day Size Exchange on unworn kits.</span>
              <span className="text-[#F1600D] font-bold text-[11px] uppercase">100% Fit Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

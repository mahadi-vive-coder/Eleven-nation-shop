import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside aria-label="Store highlights" className="bg-[#111111] text-white text-xs font-medium py-2 px-3 sm:px-4 border-b border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-6 text-[#A0A0A0]">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#F1600D]" />
            <span>Nationwide Delivery across 64 Districts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F1600D]" />
            <span>100% Match-Spec Player & Fan Editions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#F1600D]" />
            <span>Hassle-Free 7-Day Size Exchange</span>
          </div>
        </div>

        <div className="w-full md:w-auto text-center md:text-right flex items-center justify-center md:justify-end gap-2 text-xs font-bold truncate">
          <span className="text-[#F1600D]">CASH ON DELIVERY</span>
          <span className="text-[#A0A0A0] hidden sm:inline">•</span>
          <span className="text-[#E5E5E5] hidden sm:inline truncate">Inspect your kit at doorstep before paying</span>
        </div>
      </div>
    </aside>
  );
};

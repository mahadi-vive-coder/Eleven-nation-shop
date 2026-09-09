import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Truck, HelpCircle } from 'lucide-react';

interface PolicyProps {
  onNavigate: (route: string) => void;
}

export const ExchangePolicyPage: React.FC<PolicyProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666] block">
          Customer Assurance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
          EXCHANGE & RETURN POLICY
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-1">
          Guaranteed fit for every football supporter in Bangladesh
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E5E5] space-y-6 text-sm text-[#444444] leading-relaxed">
        <div className="flex items-start gap-4 p-4 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5]">
          <RefreshCw className="w-6 h-6 text-[#111111] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-[#111111] uppercase">7-Day Hassle-Free Size Exchange</h3>
            <p className="text-xs text-[#666666] mt-1">
              If your jersey doesn&apos;t fit the way you want, contact our WhatsApp or hotline within 7 days of receiving it. We will dispatch the replacement size directly to your doorstep.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-[#111111] tracking-wider">Exchange Eligibility Criteria</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Jersey must be unworn, unwashed, with all original tags attached.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Standard club and star player editions are 100% eligible for size exchange.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Kits with custom personal names (e.g. your personal custom name) are non-returnable unless defective.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#111111] block">Need an exchange initiated?</span>
            <span className="text-xs text-[#777777]">Hotline / WhatsApp: +880 1711-223344</span>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors self-start sm:self-auto"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

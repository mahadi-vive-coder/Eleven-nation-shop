import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#111111] text-white pt-12 sm:pt-16 pb-16 sm:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F1600D] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Player-Spec Quality</h4>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                Authentic fabric weaves crafted directly to match-day specifications.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F1600D] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Nationwide BD Delivery</h4>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                24-48 hours inside Dhaka. 48-72 hours across all 64 districts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F1600D] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">7-Day Size Exchange</h4>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                Guaranteed fit. Seamless size replacements if fit isn't spot-on.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F1600D] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Cash on Delivery</h4>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                Inspect your kit at your doorstep before paying. 100% confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 py-10 sm:py-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F1600D] rounded-lg flex items-center justify-center font-brand font-black text-[#111111] text-base sm:text-lg">
                11
              </div>
              <span className="font-brand font-black text-lg sm:text-xl tracking-tight text-white">
                ELEVEN NATION
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#999999] leading-relaxed max-w-sm">
              Football is not just a sport. It's identity. Eleven Nation is Bangladesh's premier football kit platform, delivering match-grade jerseys, retro classics, and official heat-press name/number printing.
            </p>
            
            <div className="mt-5 flex flex-col gap-2 text-xs text-[#888888]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F1600D] shrink-0" />
                <span>House 14, Road 8, Dhanmondi, Dhaka 1205, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F1600D] shrink-0" />
                <span>+880 1711-223344 (10 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F1600D] shrink-0" />
                <span>support@elevennation.com</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F1600D] mb-3 sm:mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#AAAAAA]">
              <li>
                <button onClick={() => onNavigate('shop?edition=Player%20Edition')} className="hover:text-white transition-colors">
                  Player Edition Kits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop?edition=Fan%20Edition')} className="hover:text-white transition-colors">
                  Fan Edition Kits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('retro')} className="hover:text-white transition-colors">
                  Retro Classics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('worldcup')} className="hover:text-white transition-colors">
                  World Cup 2026
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('clubs')} className="hover:text-white transition-colors">
                  Shop By Club
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('players')} className="hover:text-white transition-colors">
                  Player Roster Kits
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F1600D] mb-3 sm:mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#AAAAAA]">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('size-guide')} className="hover:text-white transition-colors">
                  Size Guide & Fit Spec
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('exchange-policy')} className="hover:text-white transition-colors">
                  Exchange & Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  My Orders & Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <p>© 2026 Eleven Nation Bangladesh. All rights reserved.</p>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[#888888]">Payment:</span>
            <span className="px-2.5 py-1 bg-white/10 text-white font-bold rounded text-[11px] tracking-tight">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

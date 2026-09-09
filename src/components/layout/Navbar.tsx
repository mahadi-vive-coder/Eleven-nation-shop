import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface NavbarProps {
  onOpenSearch: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, currentRoute, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const desktopNavLinks = [
    { label: 'Shop', route: 'shop' },
    { label: 'Clubs', route: 'clubs' },
    { label: 'Players', route: 'players' },
  ];

  const mobileNavLinks = [
    { label: 'Shop', route: 'shop' },
    { label: 'Clubs', route: 'clubs' },
    { label: 'Players', route: 'players' },
    { label: 'World Cup', route: 'worldcup' },
    { label: 'Track Order', route: 'track-order' },
    { label: 'Account', route: 'account' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F7F7F5]/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-xs py-2.5 sm:py-3'
            : 'bg-[#F7F7F5] border-b border-[#E5E5E5]/60 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-4">
            {/* Left: Logo */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-hidden"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#111111] rounded-lg flex items-center justify-center font-brand font-black text-[#F1600D] text-sm sm:text-base tracking-tighter group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                  11
                </div>
                <div className="leading-tight">
                  <span className="font-brand font-black text-sm xs:text-base sm:text-lg lg:text-xl tracking-tight text-[#111111] block whitespace-nowrap">
                    ELEVEN NATION
                  </span>
                  <span className="text-[7.5px] sm:text-[9px] font-bold tracking-[0.2em] text-[#666666] uppercase block hidden xs:block">
                    Football Identity
                  </span>
                </div>
              </button>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
              {desktopNavLinks.map((link) => {
                const isActive = currentRoute === link.route || currentRoute.startsWith(link.route);
                return (
                  <button
                    key={link.label}
                    onClick={() => onNavigate(link.route)}
                    className={`text-sm font-semibold tracking-tight transition-colors relative py-1 whitespace-nowrap ${
                      isActive ? 'text-[#111111] font-bold' : 'text-[#555555] hover:text-[#111111]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111] rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Search, Wishlist, Account, Cart + Mobile Hamburger */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 sm:p-2.5 text-[#333333] hover:text-black hover:bg-black/5 rounded-full transition-colors flex items-center gap-1.5 min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] justify-center"
                aria-label="Search jerseys"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xl:inline text-xs font-medium text-[#777777] bg-white px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                  Search (⌘K)
                </span>
              </button>

              {/* Wishlist (Desktop) */}
              <button
                onClick={() => onNavigate('wishlist')}
                className="hidden sm:flex p-2 sm:p-2.5 text-[#333333] hover:text-black hover:bg-black/5 rounded-full transition-colors relative min-w-[44px] min-h-[44px] items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#111111] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Account (Desktop) */}
              <button
                onClick={() => onNavigate('account')}
                className="hidden sm:flex p-2 sm:p-2.5 text-[#333333] hover:text-black hover:bg-black/5 rounded-full transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
                aria-label="Account"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative bg-[#111111] text-white hover:bg-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all hover:translate-y-[-1px] shadow-xs active:translate-y-0 min-h-[38px] sm:min-h-[44px]"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F1600D]" />
                <span className="text-xs font-bold hidden md:inline">BAG</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="bg-[#F1600D] text-white text-[10px] sm:text-[11px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* Mobile Hamburger Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#111111] hover:text-black hover:bg-black/5 rounded-xl focus:outline-hidden lg:hidden min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (Slide / Fade) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Down / In Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full bg-[#F7F7F5] border-b border-[#E5E5E5] shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#111111] rounded-lg flex items-center justify-center font-brand font-black text-[#F1600D] text-sm">
                    11
                  </div>
                  <span className="font-brand font-black text-lg text-[#111111]">ELEVEN NATION</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#111111] hover:bg-black/5 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="p-4 flex flex-col gap-1">
                {mobileNavLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      onNavigate(link.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left w-full py-3 px-4 text-base font-bold rounded-xl transition-colors flex items-center justify-between min-h-[44px] ${
                      currentRoute === link.route
                        ? 'bg-[#111111] text-[#F1600D]'
                        : 'text-[#111111] hover:bg-black/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs opacity-50">→</span>
                  </button>
                ))}
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="p-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#111111] min-h-[44px]"
                >
                  <Heart className="w-4 h-4" />
                  <span>Wishlist ({wishlistCount})</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#111111] text-white rounded-xl text-xs font-bold min-h-[44px]"
                >
                  <User className="w-4 h-4 text-[#F1600D]" />
                  <span>My Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

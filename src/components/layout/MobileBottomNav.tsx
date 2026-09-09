import React from 'react';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-2 py-2 pb-2.5 sm:pb-2 shadow-lg">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-lg mx-auto">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors ${
            currentRoute === 'home' ? 'text-[#111111] font-bold' : 'text-[#777777]'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors ${
            currentRoute === 'shop' ? 'text-[#111111] font-bold' : 'text-[#777777]'
          }`}
          aria-label="Shop"
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center w-full py-1 text-center text-[#777777] hover:text-[#111111] transition-colors"
          aria-label="Search"
        >
          <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F1600D] flex items-center justify-center -mt-3 shadow-md">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight text-[#111111] font-semibold mt-0.5">Search</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => onNavigate('wishlist')}
          className={`flex flex-col items-center justify-center w-full py-1 text-center transition-colors relative ${
            currentRoute === 'wishlist' ? 'text-[#111111] font-bold' : 'text-[#777777]'
          }`}
          aria-label="Saved"
        >
          <Heart className="w-5 h-5 mb-0.5" />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-4 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* Cart */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center w-full py-1 text-center text-[#777777] hover:text-[#111111] transition-colors relative"
          aria-label="Bag"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5 text-[#111111]" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-4 w-4 h-4 bg-[#F1600D] text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="text-[10px] tracking-tight font-bold text-[#111111]">Bag</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/product/ProductCard';

interface WishlistPageProps {
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist = [], clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  const handleAddAllToCart = () => {
    safeWishlist.forEach((product) => {
      addToCart({
        product,
        size: 'M',
        quantity: 1,
      });
    });
    openCart();
  };

  if (safeWishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#888888]">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight font-brand">
          YOUR SAVED VAULT IS EMPTY
        </h2>
        <p className="text-xs text-[#777777] max-w-sm mx-auto">
          Save player editions, retro grails, and World Cup kits to keep track of your wish list.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block">
            Saved For Later
          </span>
          <h1 className="text-3xl font-black text-[#111111] uppercase tracking-tight font-brand">
            MY WISHLIST ({safeWishlist.length})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearWishlist}
            className="px-4 py-2 text-xs font-bold text-[#777777] hover:text-red-600 border border-[#E5E5E5] rounded-xl hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleAddAllToCart}
            className="px-5 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All To Bag</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {safeWishlist.map((product) => (
          <div key={product.id} className="relative group">
            <ProductCard product={product} onSelect={onSelectProduct} />
          </div>
        ))}
      </div>
    </div>
  );
};

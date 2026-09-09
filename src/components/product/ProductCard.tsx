import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import { Product, Size } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickSizeSelected, setQuickSizeSelected] = useState<Size | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isSaved = isInWishlist(product.id);

  const images = Array.isArray(product.images) ? product.images : [];
  const inventory = Array.isArray(product.inventory) ? product.inventory : [];
  const availablePlayers = Array.isArray(product.available_players) ? product.available_players : [];

  const frontImage =
    images.find((img) => (img as any)?.image_type === 'front')?.image_url ||
    (images[0] as any)?.image_url ||
    (typeof images[0] === 'string' ? (images[0] as any) : '') ||
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800';
  const backImage =
    images.find((img) => (img as any)?.image_type === 'back')?.image_url ||
    (images[1] as any)?.image_url ||
    (typeof images[1] === 'string' ? (images[1] as any) : '') ||
    frontImage;

  const handleQuickAdd = (size: Size, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickSizeSelected(size);
    setIsAdding(true);
    addToCart({ product, size, quantity: 1 });
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(product.slug)}
      className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#E5E5E5] hover:border-black/20 hover:shadow-xl transition-all duration-300"
    >
      {/* Image Container with Front/Back hover flip */}
      <div className="relative aspect-4/5 bg-[#F0F0EE] overflow-hidden">
        {/* Front Image */}
        <motion.img
          src={frontImage}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            isHovered && backImage !== frontImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Back Image (transitions on hover) */}
        {backImage && backImage !== frontImage && (
          <motion.img
            src={backImage}
            alt={`${product.name} back`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <span className="bg-[#111111] text-[#F1600D] text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.edition_type === 'Player Edition' && (
            <span className="bg-[#111111] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
              PLAYER SPEC
            </span>
          )}
          {product.edition_type === 'Retro' && (
            <span className="bg-[#F1600D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
              RETRO VAULT
            </span>
          )}
          {product.compare_at_price && (
            <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
              SAVE ৳{product.compare_at_price - product.base_price}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-[#111111] text-red-500 shadow-md'
              : 'bg-white/80 backdrop-blur-xs text-[#111111] hover:bg-white hover:scale-110 shadow-sm'
          }`}
        >
          <motion.div
            animate={isSaved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.div>
        </button>

        {/* Quick Size Selector Drawer (slides up on hover on desktop) */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:block opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-[#E5E5E5]">
            <div className="text-[10px] font-bold text-[#666666] uppercase text-center mb-1.5 tracking-wider">
              Quick Add Size
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {inventory.map((inv) => {
                const isOutOfStock = inv.stock <= 0;
                return (
                  <button
                    key={inv.size}
                    disabled={isOutOfStock}
                    onClick={(e) => handleQuickAdd(inv.size, e)}
                    className={`text-[11px] font-bold h-7 min-w-7 px-1.5 rounded-md transition-all flex items-center justify-center ${
                      isOutOfStock
                        ? 'bg-transparent text-[#CCCCCC] line-through cursor-not-allowed'
                        : quickSizeSelected === inv.size && isAdding
                        ? 'bg-[#F1600D] text-white'
                        : 'bg-[#F0F0EE] hover:bg-[#111111] hover:text-[#F1600D] text-[#111111]'
                    }`}
                  >
                    {quickSizeSelected === inv.size && isAdding ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      inv.size
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Season & Club */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#777777] font-semibold mb-1">
            <span className="uppercase tracking-wider">{product.season}</span>
            <div className="flex items-center gap-1 text-[#111111]">
              <Star className="w-3 h-3 fill-[#111111]" />
              <span className="font-bold text-[10px] sm:text-[11px]">{product.rating}</span>
              <span className="text-[#888888] text-[9px] sm:text-[10px]">({product.review_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-xs sm:text-sm text-[#111111] leading-snug line-clamp-1 group-hover:text-black transition-colors">
            {product.name}
          </h3>

          {/* Available player badges or custom options */}
          <div className="mt-1 text-[11px] sm:text-xs text-[#666666] line-clamp-1">
            {availablePlayers.length > 0 ? (
              <span>
                {availablePlayers.map((p) => p.name).slice(0, 3).join(', ')}
              </span>
            ) : (
              <span>Custom Name & Number Available</span>
            )}
          </div>
        </div>

        {/* Pricing & Mobile Quick Action */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#F0F0EE] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] font-display">
                ৳{product.base_price}
              </span>
              {product.compare_at_price && (
                <span className="text-[10px] sm:text-xs text-[#999999] line-through">
                  ৳{product.compare_at_price}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-green-600 font-bold block">
              In Stock (Dhaka Dispatch)
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.slug);
            }}
            className="sm:hidden p-2 rounded-xl bg-[#111111] text-[#F1600D] hover:bg-black transition-colors shrink-0"
            aria-label="View jersey"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

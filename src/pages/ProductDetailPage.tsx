import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Ruler,
  ChevronRight,
} from 'lucide-react';
import { Product, Size, PlayerOption } from '../types';
import { db } from '../lib/db';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { PlayerCustomizer } from '../components/product/PlayerCustomizer';
import { SizeGuideModal } from '../components/product/SizeGuideModal';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductCard } from '../components/product/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectProduct,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption | null>(null);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error } = useToast();

  useEffect(() => {
    setLoading(true);
    db.getProductBySlug(slug).then(async (prod) => {
      let resolvedProd = prod;
      if (!resolvedProd) {
        resolvedProd = await db.getProductById(slug);
      }

      if (resolvedProd) {
        setProduct(resolvedProd);
        // Find default available size
        const firstInStock = resolvedProd.inventory.find((i) => i.stock > 0);
        if (firstInStock) setSelectedSize(firstInStock.size);

        // Fetch related products
        try {
          const all = await db.getProducts();
          const related = all.filter((p) => p.id !== resolvedProd!.id && p.club_id === resolvedProd!.club_id);
          setRelatedProducts(related.length > 0 ? related : all.filter((p) => p.id !== resolvedProd!.id).slice(0, 4));
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-black border-t-[#F1600D] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-[#111111]">Loading Kit Specification...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#111111]">Jersey Not Found</h2>
        <p className="text-xs text-[#777777]">The requested kit may have expired or sold out.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-[#111111] text-[#F1600D] rounded-xl font-bold text-xs uppercase"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const images = Array.isArray(product.images) ? product.images : [];
  const inventory = Array.isArray(product.inventory) ? product.inventory : [];
  const availablePlayers = Array.isArray(product.available_players) ? product.available_players : [];

  const currentInv = inventory.find((i) => i.size === selectedSize);
  const isOutOfStock = !currentInv || currentInv.stock <= 0;

  const handleAddToCartClick = () => {
    if (isOutOfStock) {
      error('Out of stock', `Size ${selectedSize} is currently sold out.`);
      return;
    }

    setIsAdding(true);
    addToCart({
      product,
      size: selectedSize,
      playerName: selectedPlayer?.name || customName || undefined,
      playerNumber: selectedPlayer ? selectedPlayer.number : customNumber || undefined,
      isCustom: isCustomSelected,
      quantity,
    });

    setTimeout(() => setIsAdding(false), 400);
  };

  const handleBuyNow = () => {
    handleAddToCartClick();
    onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#888888]">
        <button onClick={() => onNavigate('home')} className="hover:text-black">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-black">Jerseys</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#111111] truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Large Main Image */}
          <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-[#F0F0EE] border border-[#E5E5E5] group">
            <img
              src={
                images[selectedImageIndex]?.image_url ||
                (typeof images[selectedImageIndex] === 'string' ? (images[selectedImageIndex] as any) : '') ||
                images[0]?.image_url ||
                (typeof images[0] === 'string' ? (images[0] as any) : '') ||
                'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800'
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-[#111111] text-[#F1600D] text-xs font-black uppercase px-3 py-1 rounded-md shadow-md tracking-wider">
                {product.edition_type}
              </span>
              <span className="bg-white/90 backdrop-blur-xs text-[#111111] text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
                Season {product.season}
              </span>
            </div>

            {/* Wishlist button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isSaved
                  ? 'bg-[#111111] text-red-500 shadow-lg'
                  : 'bg-white/90 backdrop-blur-xs text-[#111111] hover:scale-110 shadow-md'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails row */}
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-[#111111] ring-2 ring-[#F1600D]'
                    : 'border-[#E5E5E5] hover:border-black opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img.image_url || (typeof img === 'string' ? img : '')} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Club & Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#777777] uppercase tracking-widest">
                {product.club?.name || 'Eleven Nation'}
              </span>
              <div className="flex items-center gap-1.5 bg-[#F0F0EE] px-2.5 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#111111] text-[#111111]" />
                <span>{product.rating}</span>
                <span className="text-[#888888]">({product.review_count} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-black text-[#111111] font-display">
                ৳{product.base_price}
              </span>
              {product.compare_at_price && (
                <span className="text-base text-[#999999] line-through">
                  ৳{product.compare_at_price}
                </span>
              )}
              {product.compare_at_price && (
                <span className="px-2 py-0.5 bg-[#F1600D] text-white rounded text-xs font-black uppercase">
                  Save ৳{product.compare_at_price - product.base_price}
                </span>
              )}
            </div>
          </div>

          {/* Description summary */}
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
            {product.description}
          </p>

          {/* SIZE SELECTION */}
          <div className="space-y-2.5 pt-2 border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                Select Size
              </label>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide & Fit</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {inventory.map((inv) => {
                const isSelected = selectedSize === inv.size;
                const isSoldOut = inv.stock <= 0;
                return (
                  <button
                    key={inv.size}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => setSelectedSize(inv.size)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all border flex flex-col items-center justify-center ${
                      isSoldOut
                        ? 'bg-[#F7F7F5] text-[#CCCCCC] border-[#E5E5E5] line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#111111] text-[#F1600D] border-[#111111] shadow-sm ring-2 ring-[#F1600D]'
                        : 'bg-white text-[#111111] border-[#E5E5E5] hover:border-black'
                    }`}
                  >
                    <span>{inv.size}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isSoldOut ? 'Sold out' : `${inv.stock} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PLAYER & CUSTOM PRINTING */}
          <div className="border-t border-[#E5E5E5]">
            <PlayerCustomizer
              availablePlayers={availablePlayers}
              selectedPlayer={selectedPlayer}
              customName={customName}
              customNumber={customNumber}
              isCustomSelected={isCustomSelected}
              onSelectPlayer={setSelectedPlayer}
              onUpdateCustomName={setCustomName}
              onUpdateCustomNumber={setCustomNumber}
              onToggleCustom={setIsCustomSelected}
            />
          </div>

          {/* QUANTITY & PRIMARY ACTION CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#E5E5E5] rounded-xl bg-white px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 py-2 text-xs font-bold text-[#555555] hover:text-black"
                >
                  -
                </button>
                <span className="px-2 text-xs font-extrabold text-[#111111]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2 py-2 text-xs font-bold text-[#555555] hover:text-black"
                >
                  +
                </button>
              </div>

              {/* Add to Cart (Primary CTA) */}
              <button
                type="button"
                onClick={handleAddToCartClick}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-4 bg-[#111111] text-[#F1600D] hover:bg-black rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:translate-y-[-1px] active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? 'ADDING TO BAG...' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              </button>
            </div>

            {/* Buy Now instant */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-white hover:bg-[#F0F0EE] text-[#111111] border-2 border-[#111111] rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              BUY NOW (DIRECT CHECKOUT)
            </button>
          </div>

          {/* Delivery & Trust Badges */}
          <div className="p-4 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] space-y-2.5 text-xs text-[#555555]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#111111] shrink-0" />
              <span>
                <strong>Dhaka:</strong> 24-48 Hours (৳70) | <strong>Nationwide:</strong> 48-72 Hours (৳130)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#111111] shrink-0" />
              <span>
                <strong>Payment:</strong> Cash on Delivery (COD) with doorstep verification
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-[#111111] shrink-0" />
              <span>
                <strong>Exchange:</strong> 7-Day hassle-free size replacement guarantee
              </span>
            </div>
          </div>

          {/* Fabric Tech Details */}
          {product.fabric_details && (
            <div className="p-4 bg-white rounded-2xl border border-[#E5E5E5] space-y-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                Fabric & Specification
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {product.fabric_details}
              </p>
              <div className="text-[11px] font-bold text-[#111111] pt-1">
                Fit: {product.fit_type}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews productId={product.id} productName={product.name} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-[#E5E5E5]">
          <h3 className="text-xl font-black text-[#111111] uppercase tracking-tight">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    deliveryLocation,
    setDeliveryLocation,
    subtotal,
    customizationTotal,
    deliveryFee,
    total,
    itemCount,
  } = useCart();

  const handleCheckoutClick = () => {
    closeCart();
    onNavigate('checkout');
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeCart}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F5]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#111111]" />
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-[#111111]">
                  YOUR SHOPPING BAG
                </h3>
                <span className="bg-[#111111] text-[#F1600D] text-xs font-black px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg text-[#666666] hover:text-black hover:bg-black/5 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fast BD Delivery Notification Bar */}
            <div className="bg-[#111111] px-4 sm:px-5 py-2.5 text-xs text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#F1600D]" />
                <span className="text-xs text-[#E5E5E5]">
                  Doorstep Cash on Delivery nationwide in 24–72h.
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#E5E5E5]">
              {items.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#F7F7F5] flex items-center justify-center mb-4 text-[#999999]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#111111]">Your bag is empty</h4>
                  <p className="text-xs text-[#777777] mt-1.5 max-w-xs leading-relaxed">
                    Explore our match-spec player editions and retro classics to build your kit rotation.
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      onNavigate('shop');
                    }}
                    className="mt-6 px-6 py-3 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const pImages = Array.isArray(item.product?.images) ? item.product.images : [];
                  const imgUrl = pImages[0]?.image_url || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80';
                  const prodName = item.product?.name || 'Football Kit';
                  const prodEdition = item.product?.edition_type || 'Jersey';
                  return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 sm:gap-4">
                    {/* Item Image */}
                    <div className="w-18 h-22 sm:w-20 sm:h-24 bg-[#F7F7F5] rounded-xl overflow-hidden shrink-0 border border-[#E5E5E5]">
                      <img
                        src={imgUrl}
                        alt={prodName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#111111] line-clamp-1 leading-snug">
                            {prodName}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#999999] hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#F0F0EE] rounded text-[#333333]">
                            Size: {item.size}
                          </span>
                          <span className="text-[10px] text-[#777777]">
                            {prodEdition}
                          </span>
                        </div>

                        {/* Player / Custom Print Tag */}
                        {(item.player_name || item.player_number) && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-[#111111] text-[#F1600D] rounded text-[10px] font-bold">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>
                              {item.player_name} #{item.player_number} (+৳250)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E5E5E5] rounded-lg overflow-hidden bg-[#F7F7F5]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 sm:p-1.5 hover:bg-[#E5E5E5] transition-colors text-[#555555]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 sm:px-2.5 text-xs font-bold text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 sm:p-1.5 hover:bg-[#E5E5E5] transition-colors text-[#555555]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-[#111111]">
                            ৳{item.total_price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#E5E5E5] bg-[#F7F7F5] space-y-3.5">
                {/* Delivery Location Selector */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-[#666666] uppercase tracking-wider block mb-1">
                    Delivery Area
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('dhaka')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                        deliveryLocation === 'dhaka'
                          ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                          : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
                      }`}
                    >
                      Inside Dhaka (৳70)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('outside')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                        deliveryLocation === 'outside'
                          ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                          : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
                      }`}
                    >
                      Outside Dhaka (৳130)
                    </button>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-1.5 text-xs text-[#666666] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#111111]">৳{subtotal}</span>
                  </div>
                  {customizationTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Custom Name/Number Printing</span>
                      <span className="font-semibold text-[#111111]">৳{customizationTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee ({deliveryLocation === 'dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span>
                    <span className="font-semibold text-[#111111]">৳{deliveryFee}</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-2 flex justify-between text-sm sm:text-base font-black text-[#111111]">
                    <span>TOTAL</span>
                    <span>৳{total}</span>
                  </div>
                </div>

                {/* Primary CTA Checkout */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 sm:py-3.5 bg-[#111111] text-[#F1600D] hover:bg-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-1px] active:translate-y-0"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

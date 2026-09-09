import React, { useState, useRef } from 'react';
import { ShieldCheck, ArrowRight, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/db';
import { District, Order } from '../types';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
  onOrderSuccess: (orderId: string) => void;
}

const BD_DISTRICTS: District[] = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Cox\'s Bazar', 'Sylhet',
  'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla',
  'Bogra', 'Jessore', 'Dinajpur', 'Tangail', 'Feni', 'Brahmanbaria'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const {
    items,
    deliveryLocation,
    setDeliveryLocation,
    subtotal,
    customizationTotal,
    deliveryFee,
    total,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const { success, error } = useToast();

  // Form Fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [district, setDistrict] = useState<District>((user?.default_district as District) || 'Dhaka');
  const [cityArea, setCityArea] = useState(user?.default_city || '');
  const [address, setAddress] = useState(user?.default_address || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Generate unique idempotency key for this checkout session
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );

  // Sync district with delivery location
  const handleDistrictChange = (dist: District) => {
    setDistrict(dist);
    if (dist === 'Dhaka') {
      setDeliveryLocation('dhaka');
    } else {
      setDeliveryLocation('outside');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error('Empty Bag', 'Please add jerseys to your bag before checking out.');
      return;
    }

    if (!fullName.trim()) {
      error('Missing Name', 'Please enter your full name.');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 11) {
      error('Invalid Phone', 'Please enter a valid 11-digit Bangladesh phone number.');
      return;
    }

    if (!address.trim()) {
      error('Missing Address', 'Please provide your full delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create real order in Supabase with server recalculation
      const newOrder = await db.createOrder({
        user_id: user?.id || null,
        customer_name: fullName,
        customer_phone: phone,
        customer_email: email,
        delivery_location: deliveryLocation,
        district: district,
        city_area: cityArea,
        delivery_address: address,
        order_notes: notes,
        idempotency_key: idempotencyKeyRef.current,
        items: items.map((item) => ({
          product_id: item.product_id,
          size: item.size,
          quantity: item.quantity,
          player_name: item.player_name,
          player_number: item.player_number,
          is_custom: item.is_custom,
        })),
      });

      // Fire victory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F1600D', '#111111', '#FFFFFF'],
        });
      } catch (err) {
        // Safe fallback
      }

      setCompletedOrder(newOrder);
      clearCart();
      success('Order Placed Successfully!', `Order ${newOrder.order_number} has been recorded.`);
      setIsSubmitting(false);
      onOrderSuccess(newOrder.id);
    } catch (err: any) {
      setIsSubmitting(false);
      error('Order Failed', err.message || 'Unable to place order. Please try again.');
    }
  };

  // If order was just placed, display instant confirmation
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E5E5E5] shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#F1600D] flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#777777] block">
              Order Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight font-brand mt-1">
              THANK YOU FOR YOUR ORDER
            </h2>
            <div className="inline-block mt-3 px-4 py-1.5 bg-[#111111] text-[#F1600D] rounded-xl font-mono text-sm font-bold">
              {completedOrder.order_number}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-md mx-auto">
            Your Cash on Delivery order has been successfully queued. Our Dhaka team is preparing your match kits. You will pay <strong>৳{completedOrder.total_amount}</strong> upon doorstep delivery.
          </p>

          <div className="p-4 bg-[#F7F7F5] rounded-2xl text-left text-xs space-y-1.5 border border-[#E5E5E5]">
            <div className="flex justify-between">
              <span className="text-[#777777]">Recipient:</span>
              <span className="font-bold text-[#111111]">{completedOrder.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777777]">Phone:</span>
              <span className="font-bold text-[#111111]">{completedOrder.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777777]">Destination:</span>
              <span className="font-bold text-[#111111]">{completedOrder.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777777]">Payment Method:</span>
              <span className="font-bold text-[#111111]">Cash on Delivery</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('track-order')}
              className="flex-1 py-3 px-4 bg-[#111111] text-[#F1600D] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
            >
              Track Order Live
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="flex-1 py-3 px-4 bg-[#F7F7F5] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#E5E5E5] transition-colors border border-[#E5E5E5]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#888888]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight">
          Your Bag is Empty
        </h2>
        <p className="text-xs text-[#777777]">
          Add your favorite matchday player kits or retro classics to proceed with checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="pb-6 sm:pb-8 border-b border-[#E5E5E5] mb-6 sm:mb-8">
        <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block">
          Fast & Secure Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight font-brand">
          FINALIZING YOUR KIT ORDER
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* LEFT COLUMN: Customer Information & Delivery Address */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Guest or Logged in Banner */}
          {!user && (
            <div className="p-4 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] flex items-center justify-between gap-3 text-xs">
              <span className="text-[#555555]">
                Have an Eleven Nation account? Sign in for saved delivery address and order history.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('account')}
                className="font-bold text-[#111111] underline shrink-0 hover:text-black"
              >
                Sign In
              </button>
            </div>
          )}

          {/* 1. Customer Details */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F1600D] text-xs flex items-center justify-center font-bold">1</span>
              <span>Customer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">
                  Phone Number (11 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#666666] block mb-1">
                Email Address (Optional for order confirmation)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanvir.football@gmail.com"
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F1600D] text-xs flex items-center justify-center font-bold">2</span>
              <span>Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value as District)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] focus:outline-hidden focus:border-black cursor-pointer"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">
                  City / Area / Police Station
                </label>
                <input
                  type="text"
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  placeholder="e.g. Dhanmondi, Gulshan, Halishahar"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#666666] block mb-1">
                Full Street Address, House & Flat <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Road #, Sector / Area, Landmark..."
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#666666] block mb-1">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call before arrival / leave at security gate"
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* 3. Payment Method (Cash on Delivery ONLY) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-xs space-y-3">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F1600D] text-xs flex items-center justify-center font-bold">3</span>
              <span>Payment Method</span>
            </h3>

            <div className="p-4 rounded-2xl border-2 border-[#111111] bg-[#F7F7F5] flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-[#111111] border-2 border-[#F1600D] flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F1600D]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-[#111111] block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-xs text-[#666666] mt-0.5 block leading-relaxed">
                    Pay cash in hand when your jerseys arrive at your doorstep. Inspect your kit upon delivery.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F1600D] text-white rounded shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-lg space-y-5 lg:sticky lg:top-24">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] pb-3 border-b border-[#E5E5E5]">
              Order Summary ({(items || []).length} Kits)
            </h3>

            {/* Item list preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-[#F0F0EE]">
              {(items || []).map((item) => {
                const pImages = Array.isArray(item.product?.images) ? item.product.images : [];
                const imgUrl = pImages[0]?.image_url || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80';
                const pName = item.product?.name || 'Football Kit';
                return (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                  <div className="w-12 h-14 rounded-lg bg-[#F7F7F5] overflow-hidden shrink-0 border border-[#E5E5E5]">
                    <img
                      src={imgUrl}
                      alt={pName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#111111] truncate">{pName}</h4>
                    <div className="text-[11px] text-[#777777]">
                      Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                    </div>
                    {(item.player_name || item.player_number) && (
                      <div className="text-[10px] text-[#111111] font-bold mt-0.5">
                        Print: {item.player_name} #{item.player_number} (+৳250)
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-[#111111] shrink-0">
                    ৳{item.total_price}
                  </span>
                </div>
              );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-[#666666] pt-3 border-t border-[#E5E5E5]">
              <div className="flex justify-between">
                <span>Product Subtotal</span>
                <span className="font-bold text-[#111111]">৳{subtotal}</span>
              </div>

              {customizationTotal > 0 && (
                <div className="flex justify-between">
                  <span>Custom Heat-Press Printing</span>
                  <span className="font-bold text-[#111111]">৳{customizationTotal}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Fee ({district})</span>
                <span className="font-bold text-[#111111]">৳{deliveryFee}</span>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-between items-baseline text-base font-black text-[#111111]">
                <span>TOTAL</span>
                <span className="text-xl sm:text-2xl font-brand font-black text-[#111111]">
                  ৳{total} BDT
                </span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#111111] text-[#F1600D] hover:bg-black rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:translate-y-[-1px] active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>PLACING ORDER...</span>
              ) : (
                <>
                  <span>PLACE ORDER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security Guarantee Note */}
            <div className="text-center text-[11px] text-[#888888] flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>Doorstep Cash on Delivery. Pay only after inspecting package.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

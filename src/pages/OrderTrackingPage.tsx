import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { db } from '../lib/db';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigate: (route: string) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Received & logged in vault' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Verified by Eleven Nation staff' },
  { status: 'customizing', label: 'Heat-Press Print', desc: 'Applying matchday letters & numbers' },
  { status: 'dispatched', label: 'Dispatched', desc: 'Handed to courier with live tracking' },
  { status: 'delivered', label: 'Delivered', desc: 'Kit delivered to customer' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      handleLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const handleLookup = async (idOrPhone: string) => {
    if (!idOrPhone.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // First try by ID
      let found = await db.getOrderById(idOrPhone.trim());

      // If not found, search by phone
      if (!found) {
        const ordersByPhone = await db.getOrdersByPhone(idOrPhone.trim());
        if (ordersByPhone.length > 0) {
          found = ordersByPhone[0];
        }
      }

      if (found) {
        setOrder(found);
      } else {
        setErrorMsg('No order found with that ID or Phone Number. Please double check.');
        setOrder(null);
      }
    } catch (err: any) {
      setErrorMsg('Failed to lookup order.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
          Real-Time Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
          TRACK YOUR JERSEY ORDER
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto">
          Enter your Order ID (e.g. ORD-1001) or 11-digit phone number to inspect your order progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(query);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888888] absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-1001) or Phone (017...)"
              className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-bold text-[#111111] placeholder-[#888888] focus:outline-hidden focus:border-black uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3 bg-[#111111] text-[#F1600D] hover:bg-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'TRACKING...' : 'TRACK ORDER'}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs font-bold text-red-600 mt-3 text-center">{errorMsg}</p>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#E5E5E5] shadow-xl overflow-hidden divide-y divide-[#E5E5E5]"
        >
          {/* Top Banner */}
          <div className="p-6 bg-[#111111] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#888888] uppercase tracking-wider font-bold">Order ID:</span>
                <span className="text-base font-black text-[#F1600D] font-mono">{order.id}</span>
              </div>
              <p className="text-xs text-[#AAAAAA] mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-[#888888] uppercase block font-semibold">Total Amount</span>
              <span className="text-2xl font-black text-white font-display">৳{order.total_amount} BDT</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#777777] mb-6">
              Fulfillment Journey
            </h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-[#E5E5E5] z-0">
                <div
                  className="h-full bg-[#111111] transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step Items */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.status} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isDone
                            ? 'bg-[#111111] text-[#F1600D] shadow-md ring-4 ring-[#F1600D]/30'
                            : 'bg-[#F0F0EE] text-[#888888]'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div>
                        <div className={`text-xs font-black uppercase ${isCurrent ? 'text-black' : 'text-[#555555]'}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] text-[#888888] sm:max-w-28 sm:mx-auto mt-0.5">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Courier & Tracking Details */}
          {order.courier_tracking_number && (
            <div className="p-6 bg-[#F7F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#F1600D] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#111111] uppercase">
                    Courier: {order.courier_name || 'Steadfast Courier'}
                  </div>
                  <div className="text-xs text-[#666666]">
                    Consignment ID: <strong className="text-[#111111] font-mono">{order.courier_tracking_number}</strong>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 self-start sm:self-auto">
                In Transit to {order.district}
              </span>
            </div>
          )}

          {/* Customer & Item Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Delivery Info */}
              <div className="space-y-1.5 text-xs">
                <span className="font-extrabold uppercase text-[#777777] tracking-wider block">
                  Delivery Destination
                </span>
                <p className="font-bold text-[#111111]">{order.customer_name}</p>
                <p className="text-[#666666]">{order.customer_phone}</p>
                <p className="text-[#666666]">{order.delivery_address}, {order.district}</p>
                {order.order_notes && (
                  <p className="text-[11px] text-[#888888] italic mt-1">Note: {order.order_notes}</p>
                )}
              </div>

              {/* Payment Info */}
              <div className="space-y-1.5 text-xs">
                <span className="font-extrabold uppercase text-[#777777] tracking-wider block">
                  Payment Details
                </span>
                <p className="font-bold text-[#111111] uppercase">
                  Method: {order.payment_method.toUpperCase()}
                </p>
                <p className="text-[#666666]">
                  Status: <strong className="uppercase text-[#111111]">{order.payment_status}</strong>
                </p>
                <p className="text-[#666666]">
                  Delivery Zone: {order.delivery_location === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka (64 Districts)'}
                </p>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
              <span className="font-extrabold uppercase text-xs text-[#777777] tracking-wider block">
                Ordered Kit Specs ({(order.items || []).length})
              </span>

              <div className="space-y-3 divide-y divide-[#F0F0EE]">
                {(order.items || []).map((item, idx) => {
                  const imgUrl = item.product_image || (item as any).product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80';
                  const pName = item.product_name || (item as any).product?.name || 'Football Jersey';
                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex gap-4 items-center">
                      <div className="w-14 h-16 rounded-xl bg-[#F7F7F5] overflow-hidden shrink-0 border border-[#E5E5E5]">
                        <img
                          src={imgUrl}
                          alt={pName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] truncate">{pName}</h4>
                        <div className="text-xs text-[#777777]">
                          Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                        </div>
                        {(item.player_name || item.player_number) && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#F1600D] px-2 py-0.5 rounded mt-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Printed: {item.player_name} #{item.player_number}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-[#111111]">
                        ৳{item.total_price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  User, Package, MapPin, Heart, LogOut, ArrowRight, 
  ShieldCheck, Trash2, Plus, Edit2, Lock, Mail, Phone,
  CheckCircle2, Clock, AlertCircle, ShoppingBag, KeyRound, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/db';
import { Order, District } from '../types';

interface AccountPageProps {
  onNavigate: (route: string) => void;
  onTrackOrder: (orderId: string) => void;
  onSelectProduct?: (slug: string) => void;
}

const BD_DISTRICTS: District[] = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', "Cox's Bazar", 'Sylhet',
  'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla',
  'Bogra', 'Jessore', 'Dinajpur', 'Tangail', 'Feni', 'Brahmanbaria'
];

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  district: District;
  city: string;
  address: string;
  is_default: boolean;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onTrackOrder, onSelectProduct }) => {
  const { user, loading: authChecking, signIn, signUp, signOut, resetPassword, updateProfile, updatePassword } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('eleven_nation_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    if (user?.default_address) {
      return [
        {
          id: 'addr-default',
          name: user.full_name || 'Customer',
          phone: user.phone || '',
          district: (user.default_district as District) || 'Dhaka',
          city: user.default_city || '',
          address: user.default_address,
          is_default: true,
        },
      ];
    }
    return [];
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDistrict, setAddrDistrict] = useState<District>('Dhaka');
  const [addrCity, setAddrCity] = useState('');
  const [addrStreet, setAddrStreet] = useState('');

  // Persist addresses to localStorage for convenience
  useEffect(() => {
    localStorage.setItem('eleven_nation_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Fetch customer orders from database when authenticated user is available
  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      db.getOrders(user.id)
        .then((data) => {
          setOrders(data);
        })
        .finally(() => {
          setOrdersLoading(false);
        });
      setProfileName(user.full_name || '');
      setProfilePhone(user.phone || '');
    } else {
      setOrders([]);
      setOrdersLoading(false);
    }
  }, [user]);

  // Auth Submit Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setConfirmationNotice(null);

    if (authMode === 'forgot') {
      if (!authEmail.trim()) {
        setAuthLoading(false);
        error('Email Required', 'Please enter your registered email address.');
        return;
      }
      const res = await resetPassword(authEmail.trim());
      setAuthLoading(false);
      if (res.success) {
        info('Password Reset Link Sent', `If an account exists for ${authEmail}, check your inbox for instructions.`);
        setAuthMode('login');
      } else {
        error('Reset Failed', res.error?.message || 'Unable to send password reset link.');
      }
      return;
    }

    if (authMode === 'login') {
      const res = await signIn(authEmail.trim(), authPassword);
      setAuthLoading(false);
      if (!res.success) {
        error('Sign In Failed', res.error?.message || 'Invalid email or password.');
      } else {
        success('Welcome to Eleven Nation', 'You are now signed in to your customer account.');
      }
    } else {
      if (!authFullName.trim() || !authPhone.trim()) {
        setAuthLoading(false);
        error('Missing Details', 'Please provide both your full name and phone number.');
        return;
      }

      const res = await signUp(authEmail.trim(), authPassword, authFullName.trim(), authPhone.trim());
      setAuthLoading(false);

      if (!res.success) {
        error('Registration Failed', res.error?.message || 'Unable to register account.');
      } else if (res.requiresConfirmation) {
        setConfirmationNotice(
          `Confirmation email sent to ${authEmail}. Please verify your email before signing in.`
        );
        info('Check Your Email', 'Please confirm your email address to activate your account.');
        setAuthMode('login');
      } else {
        success('Account Created', `Welcome to Eleven Nation, ${authFullName}!`);
      }
    }
  };

  // Profile Save Handler
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const res = await updateProfile({
      full_name: profileName.trim(),
      phone: profilePhone.trim(),
    });
    setProfileSaving(false);
    if (!res.success) {
      error('Update Failed', res.error?.message || 'Could not update profile details.');
    } else {
      success('Profile Saved', 'Your customer details were updated successfully.');
    }
  };

  // Password Change Handler
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      error('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Mismatch', 'Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const res = await updatePassword(newPassword);
    setPasswordSaving(false);
    if (!res.success) {
      error('Failed to change password', res.error?.message || 'Unable to update password.');
    } else {
      success('Password Updated', 'Your password has been updated securely.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Add / Edit Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddressId
            ? {
                ...a,
                name: addrName.trim(),
                phone: addrPhone.trim(),
                district: addrDistrict,
                city: addrCity.trim(),
                address: addrStreet.trim(),
              }
            : a
        )
      );
      success('Address Updated', 'Saved delivery address modified.');
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        name: addrName.trim(),
        phone: addrPhone.trim(),
        district: addrDistrict,
        city: addrCity.trim(),
        address: addrStreet.trim(),
        is_default: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      success('Address Added', 'New delivery location saved.');
    }
    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddrName(user?.full_name || '');
    setAddrPhone(user?.phone || '');
    setAddrDistrict((user?.default_district as District) || 'Dhaka');
    setAddrCity(user?.default_city || '');
    setAddrStreet(user?.default_address || '');
    setShowAddressModal(true);
  };

  const openEditAddressModal = (a: SavedAddress) => {
    setEditingAddressId(a.id);
    setAddrName(a.name);
    setAddrPhone(a.phone);
    setAddrDistrict(a.district);
    setAddrCity(a.city);
    setAddrStreet(a.address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    info('Address Removed');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
    success('Default Address Set');
  };

  // Move wishlist item to bag
  const handleMoveToBag = (product: any, size: string = 'L') => {
    addToCart({ product, size: size as any, quantity: 1 });
    removeFromWishlist(product.id);
    openCart();
    success('Added to Bag', `${product.name} moved to your shopping bag.`);
  };

  // -------------------------------------------------------------
  // AUTH CHECKING STATE
  // -------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-[#F1600D] rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // NOT LOGGED IN: Clean Login / Register Interface
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] shadow-lg space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#111111] rounded-2xl flex items-center justify-center font-brand font-black text-[#F1600D] text-lg sm:text-xl mx-auto shadow-xs">
              11
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-tight font-brand">
              CUSTOMER ACCOUNT
            </h1>
            <p className="text-[11px] sm:text-xs text-[#777777] max-w-xs mx-auto">
              Access your order history, manage saved addresses, and track real-time delivery.
            </p>
          </div>

          {confirmationNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{confirmationNotice}</span>
            </div>
          )}

          {/* Mode Selector */}
          {authMode !== 'forgot' ? (
            <div className="flex p-1 bg-[#F0F0EE] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setConfirmationNotice(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setConfirmationNotice(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#555555] hover:text-black"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 sm:space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Shakib Ahmed"
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black transition-colors"
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] sm:text-xs font-bold text-[#555555]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[10px] sm:text-[11px] text-[#777777] hover:text-black font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 sm:py-3.5 bg-[#111111] text-[#F1600D] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {authLoading ? (
                <span>PROCESSING...</span>
              ) : authMode === 'login' ? (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : authMode === 'register' ? (
                <>
                  <span>REGISTER ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>SEND RESET LINK</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & COD Guarantee */}
          <div className="pt-2 text-center text-[10px] sm:text-[11px] text-[#777777] flex items-center justify-center gap-1.5 border-t border-[#F0F0EE]">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>Secure Supabase Auth • Cash on Delivery</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOGGED IN CUSTOMER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Customer Header Bar */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#111111] text-[#F1600D] font-brand font-black text-lg sm:text-2xl flex items-center justify-center shrink-0">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-2xl font-black text-[#111111] truncate">
              {user.full_name || 'Valued Customer'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#777777] mt-0.5 truncate">
              {user.email} {user.phone && `• ${user.phone}`}
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            info('Signed Out', 'You have been signed out.');
          }}
          className="self-start sm:self-auto px-3.5 py-2 border border-[#E5E5E5] text-[#555555] hover:text-black hover:border-black rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOGOUT</span>
        </button>
      </div>

      {/* Tabs Navigation (Responsive scrollable pills) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-[#E5E5E5] -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#111111] text-[#F1600D] shadow-xs'
              : 'bg-white text-[#555555] hover:text-black border border-[#E5E5E5]'
          }`}
        >
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>My Orders ({(orders || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#111111] text-[#F1600D] shadow-xs'
              : 'bg-white text-[#555555] hover:text-black border border-[#E5E5E5]'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Profile & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shrink-0 ${
            activeTab === 'addresses'
              ? 'bg-[#111111] text-[#F1600D] shadow-xs'
              : 'bg-white text-[#555555] hover:text-black border border-[#E5E5E5]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Saved Addresses ({(addresses || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shrink-0 ${
            activeTab === 'wishlist'
              ? 'bg-[#111111] text-[#F1600D] shadow-xs'
              : 'bg-white text-[#555555] hover:text-black border border-[#E5E5E5]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Wishlist ({(wishlistItems || []).length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ORDERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="p-8 sm:p-12 text-center text-xs text-[#888888]">
              Loading verified orders from database...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E5E5E5] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#888888]">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase text-[#111111]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Explore our authentic Player Edition kits, Retro grails, and custom printing.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] shadow-xs space-y-3.5 sm:space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F0EE] gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#111111]">
                        {order.order_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'confirmed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-[#777777] block mt-0.5">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                    <span className="text-[11px] sm:text-xs text-[#555555]">Payment: <strong>Cash on Delivery</strong></span>
                    <span className="text-sm sm:text-base font-black text-[#111111]">৳{order.total_amount}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2 divide-y divide-[#F7F7F5]">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs pt-1.5 first:pt-0 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#111111] truncate">{item.product_name}</div>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#777777] mt-0.5">
                          <span>Size: {item.size} × {item.quantity}</span>
                          {(item.player_name || item.player_number) && (
                            <span className="px-1.5 py-0.2 bg-[#111111] text-[#F1600D] rounded text-[10px] font-bold">
                              {item.player_name} #{item.player_number}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-[#111111] shrink-0 text-right">৳{item.total_price}</span>
                    </div>
                  ))}
                </div>

                {/* Destination & Action */}
                <div className="pt-3 border-t border-[#F0F0EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[#666666] min-w-0 break-words text-[11px] sm:text-xs">
                    <span className="font-semibold text-[#111111]">Destination: </span>
                    {order.delivery_address}, {order.district}
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="px-3.5 py-2 bg-[#F7F7F5] hover:bg-[#111111] hover:text-[#F1600D] rounded-xl text-xs font-bold transition-all border border-[#E5E5E5] flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <span>Track Shipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PROFILE & PASSWORD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Profile Details */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Customer Profile</span>
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-[#EBEBE8] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#777777] cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-3 bg-[#111111] text-[#F1600D] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all disabled:opacity-50 mt-2"
              >
                {profileSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSave} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-3 bg-[#111111] text-[#F1600D] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all disabled:opacity-50 mt-2"
              >
                {passwordSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SAVED ADDRESSES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'addresses' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#111111]">
              Saved Shipping Addresses
            </h3>
            <button
              onClick={openAddAddressModal}
              className="px-3.5 py-2 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${
                  addr.is_default ? 'border-[#111111] ring-2 ring-[#F1600D]' : 'border-[#E5E5E5]'
                } shadow-xs space-y-3 relative`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-[#111111] truncate">{addr.name}</span>
                  {addr.is_default && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#111111] text-[#F1600D] rounded shrink-0">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="text-[11px] sm:text-xs text-[#666666] space-y-1 break-words">
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0" /> {addr.phone}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {addr.address}, {addr.city}, {addr.district}</p>
                </div>

                <div className="pt-2 border-t border-[#F0F0EE] flex items-center justify-between text-xs">
                  {!addr.is_default ? (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="font-bold text-[#111111] hover:underline text-[11px] sm:text-xs"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[#888888] text-[11px] sm:text-xs">Primary Delivery</span>
                  )}

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => openEditAddressModal(addr)}
                      className="p-1.5 text-[#666666] hover:text-black rounded-lg hover:bg-[#F7F7F5]"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-[#999999] hover:text-red-600 rounded-lg hover:bg-[#F7F7F5]"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: WISHLIST */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {(wishlistItems || []).length === 0 ? (
            <div className="p-6 sm:p-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E5E5E5] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto text-[#888888]">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-black uppercase text-[#111111]">Wishlist is Empty</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                Save your favorite Player Editions and retro grails to build your rotation.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
              >
                Explore Kits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {(wishlistItems || []).map((item) => {
                if (!item || !item.product) return null;
                const pImages = Array.isArray(item.product.images) ? item.product.images : [];
                const imgUrl = pImages[0]?.image_url || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80';
                return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E5E5E5] p-2.5 sm:p-3 flex flex-col justify-between space-y-2.5 sm:space-y-3 shadow-xs"
                >
                  <div
                    className="aspect-square bg-[#F7F7F5] rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => onSelectProduct?.(item.product.slug)}
                  >
                    <img
                      src={imgUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#888888] uppercase block truncate">
                      {item.product.edition_type}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-bold text-[#111111] truncate">{item.product.name}</h4>
                    <span className="text-xs sm:text-sm font-extrabold text-[#111111] block mt-0.5">
                      ৳{item.product.base_price || (item.product as any).price || 1250}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleMoveToBag(item.product)}
                      className="flex-1 py-1.5 sm:py-2 bg-[#111111] text-[#F1600D] rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-black transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3 shrink-0" />
                      <span className="truncate">Move to Bag</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="p-1.5 sm:p-2 text-[#999999] hover:text-red-600 rounded-lg border border-[#E5E5E5] transition-colors shrink-0"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* Address Edit/Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-sm sm:text-base font-black uppercase text-[#111111]">
              {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">District</label>
                  <select
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value as District)}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:outline-hidden focus:border-black"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">City / Area</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Dhanmondi"
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-[#555555] block mb-1">Full Street Address</label>
                <textarea
                  rows={2}
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="House #, Road #, Sector..."
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-[#F0F0EE] text-[#555555] rounded-xl text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

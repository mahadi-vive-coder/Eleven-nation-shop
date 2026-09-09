import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, Size } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';

interface AddToCartParams {
  product: Product;
  size: Size;
  playerName?: string;
  playerNumber?: number | string;
  isCustom?: boolean;
  quantity?: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (params: AddToCartParams) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  deliveryLocation: 'dhaka' | 'outside';
  setDeliveryLocation: (location: 'dhaka' | 'outside') => void;
  subtotal: number;
  customizationTotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CUSTOMIZATION_FEE = 250; // ৳250 BDT for custom player heat-press printing

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('eleven_nation_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>('dhaka');
  const prevUserIdRef = useRef<string | null>(null);

  // Sync with Supabase on user auth changes
  useEffect(() => {
    const currentUserId = user?.id || null;
    if (currentUserId && currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId;
      db.syncGuestCart(currentUserId, items).then((remoteItems) => {
        if (remoteItems && remoteItems.length > 0) {
          setItems(remoteItems);
        }
      });
    } else if (!currentUserId) {
      prevUserIdRef.current = null;
    }
  }, [user?.id]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('eleven_nation_cart', JSON.stringify(items));
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  }, [items]);

  const customizationTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.customization_fee * item.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    return deliveryLocation === 'dhaka' ? 70 : 130;
  }, [deliveryLocation, items.length]);

  const total = useMemo(() => {
    return subtotal + customizationTotal + deliveryFee;
  }, [subtotal, customizationTotal, deliveryFee]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const addToCart = async ({
    product,
    size,
    playerName,
    playerNumber,
    isCustom = false,
    quantity = 1,
  }: AddToCartParams) => {
    // Inventory check
    if (product.inventory && product.inventory.length > 0) {
      const inv = product.inventory.find((i) => i.size === size);
      if (inv && inv.stock <= 0) {
        error('Size Out of Stock', `Sorry, size ${size} is currently sold out.`);
        return;
      }
    }

    const hasCustomization = Boolean(playerName || playerNumber);
    const fee = hasCustomization ? CUSTOMIZATION_FEE : 0;
    const cleanPlayerName = playerName?.trim().toUpperCase() || undefined;
    const cleanPlayerNumber = playerNumber !== undefined && playerNumber !== '' ? playerNumber : undefined;

    const existingIndex = items.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.size === size &&
        item.player_name === cleanPlayerName &&
        String(item.player_number) === String(cleanPlayerNumber)
    );

    if (existingIndex > -1) {
      const targetItem = items[existingIndex];
      const newQty = targetItem.quantity + quantity;
      const updated = [...items];
      updated[existingIndex] = {
        ...targetItem,
        quantity: newQty,
        total_price: (targetItem.unit_price + targetItem.customization_fee) * newQty,
      };
      setItems(updated);

      if (user?.id && targetItem.id && !targetItem.id.startsWith('cart-')) {
        db.updateRemoteCartQuantity(targetItem.id, newQty);
      }
    } else {
      const localId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: CartItem = {
        id: localId,
        user_id: user?.id,
        product_id: product.id,
        product,
        size,
        player_name: cleanPlayerName,
        player_number: cleanPlayerNumber,
        is_custom: isCustom || hasCustomization,
        customization_fee: fee,
        quantity,
        unit_price: product.base_price,
        total_price: (product.base_price + fee) * quantity,
      };

      setItems((prev) => [newItem, ...prev]);

      if (user?.id) {
        db.addRemoteCartItem(user.id, {
          product_id: product.id,
          size,
          quantity,
          player_name: cleanPlayerName,
          player_number: cleanPlayerNumber,
          is_custom: isCustom || hasCustomization,
          customization_fee: fee,
        }).then((remoteId) => {
          if (remoteId) {
            setItems((prev) =>
              prev.map((it) => (it.id === localId ? { ...it, id: remoteId } : it))
            );
          }
        });
      }
    }

    success(
      'Added to Bag',
      `${product.name} (${size}${cleanPlayerName ? ` - ${cleanPlayerName} #${cleanPlayerNumber}` : ''})`
    );
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            total_price: (item.unit_price + item.customization_fee) * quantity,
          };
        }
        return item;
      })
    );

    if (user?.id && !itemId.startsWith('cart-')) {
      db.updateRemoteCartQuantity(itemId, quantity);
    }
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    info('Item Removed', 'Product removed from your shopping bag.');

    if (user?.id && !itemId.startsWith('cart-')) {
      db.removeRemoteCartItem(itemId);
    }
  };

  const clearCart = () => {
    setItems([]);
    if (user?.id) {
      db.clearRemoteCart(user.id);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        deliveryLocation,
        setDeliveryLocation,
        subtotal,
        customizationTotal,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

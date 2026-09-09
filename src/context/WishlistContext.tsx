import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, WishlistItem } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../lib/db';

interface WishlistContextType {
  items: WishlistItem[];
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, info } = useToast();

  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('eleven_nation_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const prevUserIdRef = useRef<string | null>(null);

  // Sync with Supabase on user login
  useEffect(() => {
    const currentUserId = user?.id || null;
    if (currentUserId && currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId;
      db.getRemoteWishlist(currentUserId).then((remoteItems) => {
        if (remoteItems && remoteItems.length > 0) {
          // Merge remote and guest items
          const existingIds = new Set(remoteItems.map((r) => r.product_id));
          const toAddRemotely = items.filter((it) => !existingIds.has(it.product_id));

          // Sync pending guest items to Supabase
          toAddRemotely.forEach((it) => {
            db.addRemoteWishlistItem(currentUserId, it.product_id);
          });

          setItems([...remoteItems, ...toAddRemotely]);
        }
      });
    } else if (!currentUserId) {
      prevUserIdRef.current = null;
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem('eleven_nation_wishlist', JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product_id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setItems((prev) => prev.filter((item) => item.product_id !== product.id));
      if (user?.id) {
        db.removeRemoteWishlistItem(user.id, product.id);
      }
      info('Removed from Wishlist', `${product.name} removed from your saved items.`);
    } else {
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        user_id: user?.id,
        product_id: product.id,
        product,
        added_at: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
      if (user?.id) {
        db.addRemoteWishlistItem(user.id, product.id);
      }
      success('Saved to Wishlist', `${product.name} added to your collection.`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
    if (user?.id) {
      db.removeRemoteWishlistItem(user.id, productId);
    }
    info('Removed from Wishlist', 'Item removed from your wishlist.');
  };

  const clearWishlist = () => {
    setItems([]);
    if (user?.id) {
      db.clearRemoteWishlist(user.id);
    }
  };

  const wishlist = (items || [])
    .map((it) => it.product)
    .filter((p): p is Product => Boolean(p && p.id));

  return (
    <WishlistContext.Provider
      value={{
        items: items || [],
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        itemCount: (items || []).length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

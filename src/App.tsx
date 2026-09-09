import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SearchModal } from './components/search/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { ClubsPage } from './pages/ClubsPage';
import { PlayersPage } from './pages/PlayersPage';
import { ExchangePolicyPage } from './pages/ExchangePolicyPage';
import { SizeGuidePage } from './pages/SizeGuidePage';

interface NavigationState {
  route: string;
  productSlug?: string | null;
  trackingOrderId?: string;
  shopFilterClub?: string;
  shopFilterEdition?: string;
}

function parseLocationToState(): NavigationState {
  if (typeof window === 'undefined') return { route: 'home' };
  
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash || hash === 'home') {
    return { route: 'home' };
  }

  if (hash.startsWith('product/')) {
    const slug = hash.replace(/^product\//, '');
    return { route: 'product-detail', productSlug: slug };
  }

  if (hash.startsWith('shop')) {
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    return {
      route: 'shop',
      shopFilterClub: params.get('club') || undefined,
      shopFilterEdition: params.get('edition') || undefined,
    };
  }

  if (hash === 'retro') {
    return { route: 'shop', shopFilterEdition: 'Retro' };
  }

  if (hash === 'worldcup') {
    return { route: 'shop', shopFilterEdition: 'World Cup' };
  }

  if (hash.startsWith('track-order')) {
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    return {
      route: 'track-order',
      trackingOrderId: params.get('id') || undefined,
    };
  }

  return { route: hash };
}

function stateToHash(state: NavigationState): string {
  if (state.route === 'home') return '#/';
  if (state.route === 'product-detail' && state.productSlug) {
    return `#/product/${state.productSlug}`;
  }
  if (state.route === 'shop') {
    const params = new URLSearchParams();
    if (state.shopFilterClub) params.set('club', state.shopFilterClub);
    if (state.shopFilterEdition) params.set('edition', state.shopFilterEdition);
    const queryString = params.toString();
    return queryString ? `#/shop?${queryString}` : '#/shop';
  }
  if (state.route === 'track-order') {
    return state.trackingOrderId ? `#/track-order?id=${state.trackingOrderId}` : '#/track-order';
  }
  return `#/${state.route}`;
}

export function AppContent() {
  const initialNavState = parseLocationToState();
  const [currentRoute, setCurrentRoute] = useState<string>(initialNavState.route);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(initialNavState.productSlug || null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(initialNavState.trackingOrderId);
  const [shopFilterClub, setShopFilterClub] = useState<string | undefined>(initialNavState.shopFilterClub);
  const [shopFilterEdition, setShopFilterEdition] = useState<string | undefined>(initialNavState.shopFilterEdition);

  // Sync initial state with browser history
  useEffect(() => {
    const currentState = {
      route: currentRoute,
      productSlug: selectedProductSlug,
      trackingOrderId,
      shopFilterClub,
      shopFilterEdition,
    };
    window.history.replaceState(currentState, '', stateToHash(currentState));

    const handlePopState = (event: PopStateEvent) => {
      const state: NavigationState = event.state || parseLocationToState();
      setCurrentRoute(state.route || 'home');
      setSelectedProductSlug(state.productSlug || null);
      setTrackingOrderId(state.trackingOrderId);
      setShopFilterClub(state.shopFilterClub);
      setShopFilterEdition(state.shopFilterEdition);
      setSearchModalOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute, selectedProductSlug]);

  const navigateTo = (newState: NavigationState, replace = false) => {
    setCurrentRoute(newState.route);
    setSelectedProductSlug(newState.productSlug || null);
    setTrackingOrderId(newState.trackingOrderId);
    setShopFilterClub(newState.shopFilterClub);
    setShopFilterEdition(newState.shopFilterEdition);

    const hash = stateToHash(newState);
    if (replace) {
      window.history.replaceState(newState, '', hash);
    } else {
      window.history.pushState(newState, '', hash);
    }
  };

  const handleNavigate = (route: string) => {
    if (route.startsWith('shop?')) {
      const params = new URLSearchParams(route.split('?')[1]);
      const clubParam = params.get('club');
      const editionParam = params.get('edition');

      navigateTo({
        route: 'shop',
        shopFilterClub: clubParam || undefined,
        shopFilterEdition: editionParam || undefined,
      });
      return;
    }

    if (route === 'retro') {
      navigateTo({
        route: 'shop',
        shopFilterEdition: 'Retro',
      });
      return;
    }

    if (route === 'worldcup') {
      navigateTo({
        route: 'shop',
        shopFilterEdition: 'World Cup',
      });
      return;
    }

    navigateTo({ route });
  };

  const handleSelectProduct = (slug: string) => {
    navigateTo({
      route: 'product-detail',
      productSlug: slug,
    });
  };

  const handleSelectClub = (clubSlug: string) => {
    navigateTo({
      route: 'shop',
      shopFilterClub: clubSlug,
    });
  };

  const handleOrderSuccess = (orderId: string) => {
    navigateTo({
      route: 'track-order',
      trackingOrderId: orderId,
    });
  };

  const handleTrackOrderFromAccount = (orderId: string) => {
    navigateTo({
      route: 'track-order',
      trackingOrderId: orderId,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#111111] font-sans antialiased selection:bg-[#F1600D] selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Top Banner with announcements */}
      <AnnouncementBar />

      {/* Primary Sticky Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Dynamic View Page */}
      <main className="flex-1 pb-20 lg:pb-0 w-full min-w-0 max-w-full overflow-x-hidden">
        {currentRoute === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'shop' && (
          <ShopPage
            initialClub={shopFilterClub}
            initialEdition={shopFilterEdition}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'product-detail' && selectedProductSlug && (
          <ProductDetailPage
            slug={selectedProductSlug}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentRoute === 'track-order' && (
          <OrderTrackingPage
            initialOrderId={trackingOrderId}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'account' && (
          <AccountPage
            onNavigate={handleNavigate}
            onTrackOrder={handleTrackOrderFromAccount}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'clubs' && (
          <ClubsPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'players' && (
          <PlayersPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'exchange-policy' && (
          <ExchangePolicyPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'size-guide' && (
          <SizeGuidePage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Global Interactive Overlays */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectClub={handleSelectClub}
        onNavigate={handleNavigate}
      />

      <CartDrawer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

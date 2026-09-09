import {
  Product,
  Club,
  Category,
  Order,
  Review,
  Player,
  OrderItemSnapshot,
  CartItem,
  WishlistItem,
  UserProfile,
  StoreSettings,
  Size,
  JerseyEdition,
  OrderStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export const db = {
  // ============================================================================
  // CATEGORIES
  // ============================================================================
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase categories error:', error.message);
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return (data || []) as Category[];
  },

  // ============================================================================
  // CLUBS
  // Derived dynamically from products and categories in Supabase
  // ============================================================================
  async getClubs(): Promise<Club[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      // First attempt querying a dedicated clubs table if it exists
      const { data: directClubs, error: clubsErr } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true });

      if (!clubsErr && Array.isArray(directClubs) && directClubs.length > 0) {
        return directClubs as Club[];
      }
    } catch {
      // Ignore if table does not exist
    }

    // Derive clubs dynamically from distinct club values in products table
    try {
      const { data, error } = await supabase
        .from('products')
        .select('club')
        .not('club', 'is', null)
        .neq('club', '');

      if (error || !data) return [];

      const clubSet = new Set<string>();
      data.forEach((p: { club: string | null }) => {
        if (p.club && p.club.trim()) {
          clubSet.add(p.club.trim());
        }
      });

      return Array.from(clubSet).map((clubName) => {
        const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return {
          id: `club-${slug}`,
          name: clubName,
          slug,
          logo_url: '',
          country: '',
          league: 'Matchday Selection',
          description: `Official ${clubName} jerseys and kits.`,
        };
      });
    } catch (e) {
      console.error('Failed to derive clubs from products:', e);
      return [];
    }
  },

  async getClubBySlug(slug: string): Promise<Club | null> {
    if (!slug) return null;
    const clubs = await this.getClubs();
    return (
      clubs.find((c) => c.slug.toLowerCase() === slug.toLowerCase() || c.id.toLowerCase() === slug.toLowerCase()) ||
      null
    );
  },

  // ============================================================================
  // PRODUCTS (Supabase Single Source of Truth)
  // Schema: id (UUID), name, slug, description, club, category_id, edition,
  // selling_price, compare_at_price, is_featured, is_trending, is_bestseller,
  // is_new_arrival, sizes (JSONB), images (text[]), status, stock,
  // allow_custom_name, allow_custom_number, customization_fee
  // ============================================================================
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured. Please check your credentials.');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase products query error:', error.message);
      throw new Error(`Failed to load products: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => this.formatProduct(item));
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug) return null;
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Supabase getProductBySlug error:', error.message);
      throw new Error(`Failed to load product: ${error.message}`);
    }

    if (!data) return null;
    return this.formatProduct(data);
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!id) return null;
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getProductById error:', error.message);
      return null;
    }

    if (!data) return null;
    return this.formatProduct(data);
  },

  formatProduct(raw: any): Product {
    if (!raw) {
      throw new Error('formatProduct called with invalid raw data');
    }

    // 1. Resolve images: Supabase column `images` is string[]
    let rawImages: string[] = [];
    if (Array.isArray(raw.images)) {
      rawImages = raw.images.map((item) => (typeof item === 'string' ? item : item.image_url || String(item)));
    } else if (typeof raw.images === 'string') {
      try {
        const parsed = JSON.parse(raw.images);
        if (Array.isArray(parsed)) {
          rawImages = parsed.map((item) => (typeof item === 'string' ? item : item.image_url || String(item)));
        } else {
          rawImages = [raw.images];
        }
      } catch {
        rawImages = [raw.images];
      }
    } else if (raw.image_url) {
      rawImages = [raw.image_url];
    }

    if (rawImages.length === 0) {
      rawImages = ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800'];
    }

    const images = rawImages.map((url, idx) => ({
      id: idx + 1,
      product_id: raw.id,
      image_url: url,
      image_type: (idx === 0 ? 'front' : idx === 1 ? 'back' : 'detail') as 'front' | 'back' | 'detail',
      sort_order: idx,
    }));

    // 2. Resolve inventory from `sizes` column: [{ size: 'S', stock: 4 }, ...]
    let rawSizes: any[] = [];
    if (Array.isArray(raw.sizes)) {
      rawSizes = raw.sizes;
    } else if (typeof raw.sizes === 'string') {
      try {
        const parsed = JSON.parse(raw.sizes);
        if (Array.isArray(parsed)) rawSizes = parsed;
      } catch {
        // ignore
      }
    }

    let inventory = [];
    if (rawSizes.length > 0) {
      inventory = rawSizes.map((s: any, idx: number) => ({
        id: idx + 1,
        product_id: raw.id,
        size: (s.size || s) as Size,
        stock: Number(s.stock ?? s.quantity ?? 0),
        sku: `${raw.slug || 'jersey'}-${s.size || s}`,
      }));
    } else {
      const defaultStock = Math.max(0, Math.floor((Number(raw.stock) || 10) / 5));
      inventory = (['S', 'M', 'L', 'XL', 'XXL'] as Size[]).map((size, idx) => ({
        id: idx + 1,
        product_id: raw.id,
        size,
        stock: defaultStock,
        sku: `${raw.slug || 'jersey'}-${size}`,
      }));
    }

    // 3. Resolve club
    let clubObj: Club | undefined;
    if (raw.club && typeof raw.club === 'string') {
      const slug = raw.club.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      clubObj = {
        id: `club-${slug}`,
        name: raw.club,
        slug,
        logo_url: '',
        country: '',
        league: 'Matchday Selection',
        description: '',
      };
    } else if (raw.club && typeof raw.club === 'object') {
      clubObj = raw.club;
    }

    // 4. Resolve edition
    const editionType: JerseyEdition =
      raw.edition === 'Retro'
        ? 'Retro'
        : raw.edition === 'Fan Edition'
        ? 'Fan Edition'
        : raw.edition === 'World Cup'
        ? 'World Cup'
        : raw.edition === 'Special Edition'
        ? 'Special Edition'
        : 'Player Edition';

    // 5. Resolve available players
    let availablePlayers = [];
    if (Array.isArray(raw.available_players)) {
      availablePlayers = raw.available_players;
    }

    const clubId = clubObj ? clubObj.id : (raw.club_id || 'club-general');

    return {
      id: raw.id,
      name: raw.name || 'Football Jersey',
      slug: raw.slug || `jersey-${raw.id}`,
      description: raw.description || '',
      club_id: clubId,
      club: clubObj,
      category_id: raw.category_id || undefined,
      category: raw.category || undefined,
      category_name: raw.category?.name || raw.edition || 'Football Kit',
      season: raw.season || '2026/27',
      edition_type: editionType,
      base_price: Number(raw.selling_price) || 0,
      compare_at_price: raw.compare_at_price ? Number(raw.compare_at_price) : undefined,
      featured: Boolean(raw.is_featured),
      trending: Boolean(raw.is_trending),
      bestseller: Boolean(raw.is_bestseller),
      active: raw.status === 'active',
      images,
      available_players: availablePlayers,
      inventory,
      rating: Number(raw.rating) || 5.0,
      review_count: Number(raw.review_count) || 0,
      fabric_details: raw.fabric_details || '100% Recycled Polyester Moisture-wicking Jacquard',
      fit_type: raw.fit_type || (editionType === 'Player Edition' ? 'Athletic Slim Fit' : 'Standard Regular Fit'),
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at,
    };
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    const featured = products.filter((p) => p.featured && p.active);
    return featured.length > 0 ? featured : products.slice(0, 4);
  },

  async getTrendingProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    const trending = products.filter((p) => p.trending && p.active);
    return trending.length > 0 ? trending : products.slice(0, 6);
  },

  // ============================================================================
  // PLAYERS ROSTER
  // ============================================================================
  async getPlayers(): Promise<Player[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data as Player[];
        }
      } catch {
        // Table does not exist, derive from active products
      }
    }

    try {
      const products = await this.getProducts();
      const playerMap = new Map<string, Player>();

      for (const prod of products) {
        if (Array.isArray(prod.available_players)) {
          for (const pl of prod.available_players) {
            const key = `${pl.name}-${pl.number}`;
            if (!playerMap.has(key)) {
              playerMap.set(key, {
                id: pl.id || key,
                name: pl.name,
                number: pl.number,
                club_name: prod.club?.name || prod.name,
                jersey_slug: prod.slug,
                image_url: pl.image_url || prod.images[0]?.image_url,
              });
            }
          }
        }
      }

      return Array.from(playerMap.values());
    } catch {
      return [];
    }
  },

  // ============================================================================
  // STORE SETTINGS
  // ============================================================================
  async getStoreSettings(): Promise<StoreSettings | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as StoreSettings;
      }
    } catch (e) {
      console.warn('Could not load store settings:', e);
    }
    return null;
  },

  // ============================================================================
  // CUSTOMER PROFILES (Supabase profiles table)
  // ============================================================================
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!userId || !isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          email: '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url,
          default_district: data.default_district || 'Dhaka',
          default_city: data.default_city || '',
          default_address: data.default_address || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('Supabase getProfile error:', e);
    }
    return null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!userId || !isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: updates.full_name,
        phone: updates.phone,
        default_district: updates.default_district,
        default_city: updates.default_city,
        default_address: updates.default_address,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (e) {
      console.error('Supabase updateProfile error:', e);
      return false;
    }
  },

  // ============================================================================
  // ORDERS (Strict Supabase Database Contract)
  // Table: orders & order_items
  // ============================================================================
  async createOrder(params: {
    user_id?: string | null;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_location: 'dhaka' | 'outside';
    district: string;
    city_area: string;
    delivery_address: string;
    order_notes?: string;
    idempotency_key?: string;
    items: Array<{
      product_id: string;
      size: Size;
      quantity: number;
      player_name?: string;
      player_number?: number | string;
      is_custom?: boolean;
    }>;
  }): Promise<Order> {
    // Send order creation to backend API which inserts with database-backed idempotency & atomic inventory deduction
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (params.idempotency_key) {
      headers['Idempotency-Key'] = params.idempotency_key;
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create order (Status ${response.status})`);
    }

    const json = await response.json();
    if (!json.order) {
      throw new Error('Server did not return a valid order object');
    }

    return this.formatOrder(json.order);
  },

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return this.getUserOrders(userId);
    }
    return [];
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (!userId || !isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getUserOrders error:', error.message);
      throw new Error(`Failed to load orders: ${error.message}`);
    }

    return (data || []).map((row: any) => this.formatOrder(row));
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (!orderId) return null;
    const cleanId = orderId.trim();

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.order) return this.formatOrder(json.order);
      }
    } catch {
      // ignore
    }

    if (isSupabaseConfigured && supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      let query = supabase.from('orders').select('*, order_items(*)');
      if (isUuid) {
        query = query.or(`id.eq.${cleanId},order_number.ilike.${cleanId}`);
      } else {
        query = query.ilike('order_number', cleanId);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return this.formatOrder(data);
      }
    }

    return null;
  },

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) return [];

    try {
      const res = await fetch(`/api/orders/phone/${encodeURIComponent(cleanPhone)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.orders)) {
          return json.orders.map((o: any) => this.formatOrder(o));
        }
      }
    } catch {
      // ignore
    }

    return [];
  },

  async trackOrder(orderNumber: string, phone: string): Promise<Order | null> {
    const cleanNum = orderNumber.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanNum || !cleanPhone) return null;

    const res = await fetch(
      `/api/orders/track?orderNumber=${encodeURIComponent(cleanNum)}&phone=${encodeURIComponent(cleanPhone)}`
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Order lookup failed');
    }

    const json = await res.json();
    if (!json.order) return null;
    return this.formatOrder(json.order);
  },

  formatOrder(data: any): Order {
    const orderItems: OrderItemSnapshot[] = Array.isArray(data.order_items)
      ? data.order_items.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id || '',
          product_name: item.product_name,
          product_image: item.product_image || '',
          size: (item.size || 'M') as Size,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          player_name: item.custom_name || item.player_name || undefined,
          player_number: item.custom_number || item.player_number || undefined,
          is_custom: Boolean(item.custom_name || item.custom_number || item.is_custom),
          customization_fee: Number(item.customization_fee) || 0,
          total_price: Number(item.subtotal ?? item.total_price) || 0,
        }))
      : [];

    const deliveryFee = Number(data.delivery_fee) || 70;
    const isOutside = deliveryFee === 130;

    const rawStatus = (data.order_status || data.status || 'pending').toLowerCase();
    const status = (
      rawStatus === 'confirmed'
        ? 'confirmed'
        : rawStatus === 'customizing'
        ? 'customizing'
        : rawStatus === 'dispatched'
        ? 'dispatched'
        : rawStatus === 'delivered'
        ? 'delivered'
        : rawStatus === 'cancelled'
        ? 'cancelled'
        : 'pending'
    );

    return {
      id: data.id,
      order_number: data.order_number || `ORD-${data.id.slice(0, 8)}`,
      user_id: data.customer_id || data.user_id || null,
      customer_name: data.customer_name || 'Customer',
      customer_phone: data.customer_phone || '',
      customer_email: data.customer_email || undefined,
      delivery_location: isOutside ? 'outside' : 'dhaka',
      district: data.city || 'Dhaka',
      city_area: data.city || '',
      delivery_address: data.shipping_address || data.delivery_address || '',
      order_notes: data.customer_notes || data.notes || data.order_notes || undefined,
      payment_method: 'cash_on_delivery',
      payment_status: data.payment_status || 'pending',
      status,
      subtotal: Number(data.subtotal) || 0,
      delivery_fee: deliveryFee,
      customization_total: Number(data.customization_total) || 0,
      total_amount: Number(data.total_amount) || 0,
      items: orderItems,
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed',
          timestamp: new Date(data.created_at || Date.now()).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          description: 'Cash on Delivery order received and registered in Eleven Nation vault.',
        },
        ...(status !== 'pending'
          ? [
              {
                status: status as OrderStatus,
                label: status.toUpperCase(),
                timestamp: new Date(data.updated_at || Date.now()).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
                description: `Order updated to ${status}.`,
              },
            ]
          : []),
      ],
      courier_name: data.courier_name,
      courier_tracking_number: data.courier_tracking_number,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  },

  // ============================================================================
  // REVIEWS
  // ============================================================================
  async getReviews(productId?: string): Promise<Review[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) {
        query = query.eq('product_id', productId);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data as Review[];
      }
    } catch {
      // Table does not exist in schema
    }
    return [];
  },

  async addReview(review: {
    product_id: string;
    user_id?: string | null;
    user_name: string;
    rating: number;
    comment: string;
    player_edition_bought?: string;
  }): Promise<Review> {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      product_id: review.product_id,
      user_id: review.user_id || null,
      user_name: review.user_name.trim(),
      rating: review.rating,
      comment: review.comment.trim(),
      verified_purchase: false,
      player_edition_bought: review.player_edition_bought?.trim() || undefined,
      approved: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reviews').insert(newReview);
      } catch (e) {
        console.warn('Could not insert review to Supabase:', e);
      }
    }

    return newReview;
  },

  // ============================================================================
  // REMOTE CART & WISHLIST STUBS (Safe client-side or Supabase)
  // ============================================================================
  async getRemoteCart(_userId: string): Promise<CartItem[]> {
    return [];
  },
  async addRemoteCartItem(_userId: string, _item: any): Promise<string | null> {
    return null;
  },
  async updateRemoteCartQuantity(_itemId: string, _quantity: number): Promise<void> {},
  async removeRemoteCartItem(_itemId: string): Promise<void> {},
  async clearRemoteCart(_userId: string): Promise<void> {},
  async syncGuestCart(_userId: string, guestItems: CartItem[]): Promise<CartItem[]> {
    return guestItems;
  },
  async getRemoteWishlist(_userId: string): Promise<WishlistItem[]> {
    return [];
  },
  async addRemoteWishlistItem(_userId: string, _productId: string): Promise<string | null> {
    return null;
  },
  async removeRemoteWishlistItem(_userId: string, _productId: string): Promise<void> {},
  async clearRemoteWishlist(_userId: string): Promise<void> {},
};

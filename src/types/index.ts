export type JerseyEdition = 'Player Edition' | 'Fan Edition' | 'Retro' | 'Special Edition' | 'World Cup';

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type DeliveryLocation = 'dhaka' | 'outside';

export type District =
  | 'Dhaka'
  | 'Gazipur'
  | 'Narayanganj'
  | 'Chittagong'
  | "Cox's Bazar"
  | 'Sylhet'
  | 'Rajshahi'
  | 'Khulna'
  | 'Barisal'
  | 'Rangpur'
  | 'Mymensingh'
  | 'Comilla'
  | 'Bogra'
  | 'Jessore'
  | 'Dinajpur'
  | 'Tangail'
  | 'Feni'
  | 'Brahmanbaria';

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  country: string;
  league: string;
  description: string;
  primary_color?: string;
  created_at?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  club_name?: string;
  jersey_slug?: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductPlayer {
  product_id: string;
  player_id: string;
  additional_price?: number;
  player?: Player;
}

export interface ProductInventory {
  id?: number | string;
  product_id?: string;
  size: Size;
  stock: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id?: number | string;
  product_id?: string;
  image_url: string;
  image_type?: 'front' | 'back' | 'detail' | 'model';
  sort_order?: number;
  created_at?: string;
}

export interface PlayerOption {
  id: string;
  name: string;
  number: number;
  slug?: string;
  image_url?: string;
  additional_price?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  club_id: string;
  club?: Club;
  category_id?: string;
  category?: Category;
  category_name?: JerseyEdition | string;
  season: string;
  edition_type: JerseyEdition;
  base_price: number;
  compare_at_price?: number;
  featured: boolean;
  trending: boolean;
  bestseller: boolean;
  active: boolean;
  images: ProductImage[];
  available_players: PlayerOption[];
  inventory: ProductInventory[];
  rating: number;
  review_count: number;
  fabric_details?: string;
  fit_type?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  size: Size;
  player_name?: string;
  player_number?: number | string;
  is_custom: boolean;
  customization_fee: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface WishlistItem {
  id: string;
  user_id?: string;
  product_id: string;
  product: Product;
  added_at?: string;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'customizing' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface OrderItemSnapshot {
  id?: number | string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  size: Size;
  quantity: number;
  unit_price: number;
  player_name?: string;
  player_number?: number | string;
  is_custom: boolean;
  customization_fee: number;
  total_price: number;
  created_at?: string;
}

export interface OrderEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_location: DeliveryLocation;
  district: string;
  city_area: string;
  delivery_address: string;
  order_notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  customization_total: number;
  total_amount: number;
  items: OrderItemSnapshot[];
  timeline: OrderEvent[];
  courier_name?: string;
  courier_tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  user_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  player_edition_bought?: string;
  created_at: string;
  approved: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  default_district?: string;
  default_city?: string;
  default_address?: string;
  created_at: string;
  updated_at?: string;
}

export interface StoreSettings {
  id?: string;
  store_name?: string;
  currency_symbol?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
}

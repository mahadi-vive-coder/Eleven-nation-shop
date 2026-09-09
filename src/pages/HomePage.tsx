import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Shield, Trophy, Flame, ChevronRight, Star, Heart, CheckCircle2 } from 'lucide-react';
import { Product, Club } from '../types';
import { db } from '../lib/db';
import { ProductCard } from '../components/product/ProductCard';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([db.getProducts(), db.getClubs()]).then(([pData, cData]) => {
      setProducts(pData);
      setClubs(cData);
      setLoading(false);
    });
  }, []);

  const featuredProduct = (products || []).find((p) => p && p.featured && p.active) || products?.[0] || null;
  const bestSellers = (products || []).filter((p) => p && p.bestseller && p.active).slice(0, 4);
  const retroJerseys = (products || []).filter((p) => p && p.edition_type === 'Retro' && p.active).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION (Staggered Animations & High Contrast Typography) */}
      <section className="relative overflow-hidden bg-[#111111] text-white pt-12 pb-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tag / Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#F1600D] text-xs font-black uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>BANGLADESH&apos;S NO. 1 JERSEY VAULT</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-brand font-black text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight uppercase"
            >
              WEAR THE GAME. <br />
              <span className="text-[#F1600D]">OWN THE MOMENT.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#A0A0A0] max-w-xl font-normal leading-relaxed"
            >
              Engineered matchday Player Editions, Fan kits, Retro classics, and custom name/number heat-press printing. Delivering football identity nationwide.
            </motion.p>

            {/* Action CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => onNavigate('shop')}
                className="px-8 py-4 bg-[#F1600D] text-white hover:bg-[#d95308] font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl hover:translate-y-[-2px] flex items-center gap-2 group cursor-pointer"
              >
                <span>SHOP 26/27 KITS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('retro')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all border border-white/20 hover:translate-y-[-2px] cursor-pointer"
              >
                EXPLORE RETRO VAULT
              </button>
            </motion.div>

            {/* Micro proof badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-[#888888]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F1600D]" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F1600D]" />
                <span>64 Districts Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F1600D]" />
                <span>Custom Name Printing</span>
              </div>
            </motion.div>
          </div>

          {/* Right Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/20 shadow-2xl p-3">
              <div className="aspect-4/5 rounded-2xl overflow-hidden relative group bg-neutral-900 flex items-center justify-center">
                {featuredProduct && featuredProduct.images?.[0]?.image_url ? (
                  <>
                    <img
                      src={featuredProduct.images[0].image_url}
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                      <span className="bg-[#F1600D] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded self-start tracking-wider mb-2">
                        FEATURED DROP
                      </span>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                        {featuredProduct.name}
                      </h3>
                      <p className="text-xs text-[#CCCCCC] mt-1 line-clamp-2">
                        {featuredProduct.description || 'Authentic matchday specification jersey with official heat-press lettering.'}
                      </p>
                      <button
                        onClick={() => onSelectProduct(featuredProduct.slug)}
                        className="mt-3 text-xs font-extrabold text-[#F1600D] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Kit Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-[#F1600D] mx-auto" />
                    <h3 className="text-lg font-bold text-white uppercase">ELEVEN NATION VAULT</h3>
                    <p className="text-xs text-neutral-400">Discover authentic player editions and match kits.</p>
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-4 py-2 bg-[#F1600D] text-white rounded-xl font-bold text-xs uppercase hover:bg-[#d95308]"
                    >
                      Explore Catalog
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CLUB STRIP / TRENDING CLUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block">
              Club Identity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
              TRENDING CLUBS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('clubs')}
            className="text-xs font-bold text-[#111111] hover:text-[#555555] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <span>View All Clubs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl animate-pulse border border-[#E5E5E5]" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-[#E5E5E5] text-center text-xs text-[#777777]">
            Clubs are currently being synced with Supabase database.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {clubs.slice(0, 6).map((club) => (
              <button
                key={club.id}
                onClick={() => onNavigate(`shop?club=${club.slug}`)}
                className="p-4 bg-white rounded-2xl border border-[#E5E5E5] hover:border-black/30 hover:shadow-lg transition-all text-left flex flex-col justify-between group h-28 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#888888] uppercase">
                    {club.league}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-black group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111] group-hover:text-black truncate">
                    {club.name}
                  </h3>
                  <span className="text-[11px] text-[#777777]">Kits & Drops</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-red-600" />
              <span>High Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
              BESTSELLING JERSEYS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-[#111111] hover:text-[#555555] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <span>Explore All Kits</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-[#E5E5E5]" />
            ))}
          </div>
        ) : (bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-[#E5E5E5] text-center space-y-3">
            <h3 className="text-base font-bold text-[#111111]">No jerseys currently published</h3>
            <p className="text-xs text-[#777777]">Connect and populate your Supabase `products` table to display live kits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. PLAYER EDITION SPOTLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#111111] text-white overflow-hidden p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="bg-[#F1600D] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-widest">
                PLAYER SPEC VS FAN SPEC
              </span>
              <h2 className="font-brand font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                WHAT MAKES PLAYER EDITION SUPERIOR?
              </h2>
              <p className="text-sm text-[#AAAAAA] leading-relaxed">
                Engineered with micro-perforated Heat.Rdy / Dri-FIT ADV fabrics, heat-transferred metallic 3D crests, and athletic aerodynamic cuts. The exact specification worn by players on pitch.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-[#F1600D] uppercase">Weight</div>
                  <div className="text-sm font-extrabold text-white">72 - 85 Grams</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-[#F1600D] uppercase">Crest</div>
                  <div className="text-sm font-extrabold text-white">Heat-Bonded 3D</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('shop?edition=Player%20Edition')}
                className="mt-4 px-6 py-3.5 bg-[#F1600D] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#d95308] transition-colors cursor-pointer"
              >
                Shop All Player Editions →
              </button>
            </div>

            <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85"
                alt="Player Edition Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. RETRO CLASSICS VAULT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Timeless Grails</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
              RETRO CLASSICS VAULT
            </h2>
          </div>
          <button
            onClick={() => onNavigate('retro')}
            className="text-xs font-bold text-[#111111] hover:text-[#555555] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <span>View All Retro</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-[#E5E5E5]" />
            ))}
          </div>
        ) : (retroJerseys.length > 0 ? retroJerseys : products.slice(0, 4)).length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-[#E5E5E5] text-center text-xs text-[#777777]">
            Retro edition jerseys will appear here once added in Supabase.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(retroJerseys.length > 0 ? retroJerseys : products.slice(0, 4)).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. SOCIAL CULTURE GRID ("FOLLOW THE CULTURE") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#777777] uppercase tracking-widest">
            #ELEVENNATION ON INSTAGRAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            FOLLOW THE CULTURE
          </h2>
          <p className="text-xs sm:text-sm text-[#666666]">
            Tagged by supporters across Dhaka, Chittagong, Sylhet, and beyond. Tag @elevennation to be featured.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#EBEBE8] relative group">
            <img
              src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80"
              alt="Matchday Look"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              @dhakafans
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#EBEBE8] relative group">
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80"
              alt="Matchday Look"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              @madridistas_bd
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#EBEBE8] relative group">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80"
              alt="Matchday Look"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              @culers_dhaka
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#EBEBE8] relative group">
            <img
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80"
              alt="Matchday Look"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              @eleven_community
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

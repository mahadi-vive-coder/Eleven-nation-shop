import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, SlidersHorizontal, RotateCcw, Check, ArrowUpDown } from 'lucide-react';
import { Product, Club, Size, JerseyEdition } from '../types';
import { db } from '../lib/db';
import { ProductCard } from '../components/product/ProductCard';

interface ShopPageProps {
  initialClub?: string;
  initialEdition?: string;
  onSelectProduct: (slug: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialClub,
  initialEdition,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedClub, setSelectedClub] = useState<string>(initialClub || 'all');
  const [selectedEdition, setSelectedEdition] = useState<string>(initialEdition || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([db.getProducts(), db.getClubs()]).then(([pData, cData]) => {
      setProducts(pData);
      setClubs(cData);
      if (pData.length > 0) {
        const highest = Math.max(...pData.map((p) => p.base_price || 0));
        setPriceMax(Math.max(highest + 500, 3000));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Update filter if initial prop changes
  useEffect(() => {
    if (initialClub) setSelectedClub(initialClub);
  }, [initialClub]);

  useEffect(() => {
    if (initialEdition) setSelectedEdition(initialEdition);
  }, [initialEdition]);

  const editions: JerseyEdition[] = ['Player Edition', 'Fan Edition', 'Retro', 'World Cup'];
  const sizes: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const seasons = useMemo(() => {
    const unique = Array.from(new Set((products || []).map((p) => p.season).filter(Boolean)));
    return unique.length > 0 ? unique : ['2026/27'];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = (products || []).filter((p) => p && p.active);

    // Club filter
    if (selectedClub !== 'all') {
      const clubObj = (clubs || []).find((c) => c && (c.slug === selectedClub || c.id === selectedClub));
      if (clubObj) {
        result = result.filter((p) => p.club_id === clubObj.id);
      }
    }

    // Edition filter
    if (selectedEdition !== 'all') {
      result = result.filter((p) => {
        const pEd = (p.edition_type || '').toLowerCase();
        const selEd = selectedEdition.toLowerCase();
        return pEd === selEd || pEd.includes(selEd) || selEd.includes(pEd);
      });
    }

    // Size filter
    if (selectedSize !== 'all') {
      result = result.filter((p) =>
        Array.isArray(p.inventory) && p.inventory.some((inv) => inv.size === selectedSize && inv.stock > 0)
      );
    }

    // Season filter
    if (selectedSeason !== 'all') {
      result = result.filter((p) => p.season === selectedSeason);
    }

    // Price Max filter
    result = result.filter((p) => (p.base_price || 0) <= priceMax);

    // Sorting
    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    } else if (sortBy === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } else if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    }

    return result;
  }, [products, clubs, selectedClub, selectedEdition, selectedSize, selectedSeason, priceMax, sortBy]);

  const handleResetFilters = () => {
    setSelectedClub('all');
    setSelectedEdition('all');
    setSelectedSize('all');
    setSelectedSeason('all');
    setPriceMax(2500);
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedClub !== 'all' ||
    selectedEdition !== 'all' ||
    selectedSize !== 'all' ||
    selectedSeason !== 'all' ||
    priceMax < 2500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-xs font-bold text-[#777777] uppercase tracking-wider block">
            Official Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight font-brand">
            SHOP ALL JERSEYS
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Showing {filteredProducts.length} authentic specification kits
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#111111] flex items-center gap-2 shadow-xs"
          >
            <Filter className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-3 py-2 rounded-xl text-xs font-bold text-[#111111] shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#777777]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-8 pr-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#777777] hover:text-black flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Edition Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
              Edition Type
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedEdition('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                  selectedEdition === 'all'
                    ? 'bg-[#111111] text-[#F1600D]'
                    : 'text-[#555555] hover:bg-black/5'
                }`}
              >
                <span>All Editions</span>
              </button>
              {editions.map((ed) => (
                <button
                  key={ed}
                  onClick={() => setSelectedEdition(ed)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedEdition === ed
                      ? 'bg-[#111111] text-[#F1600D]'
                      : 'text-[#555555] hover:bg-black/5'
                  }`}
                >
                  <span>{ed}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Club Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
              Club / Team
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedClub('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedClub === 'all'
                    ? 'bg-[#111111] text-[#F1600D]'
                    : 'text-[#555555] hover:bg-black/5'
                }`}
              >
                All Clubs
              </button>
              {clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => setSelectedClub(club.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                    selectedClub === club.slug
                      ? 'bg-[#111111] text-[#F1600D]'
                      : 'text-[#555555] hover:bg-black/5'
                  }`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
              Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedSize === 'all'
                    ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                    : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
                }`}
              >
                All
              </button>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                    selectedSize === s
                      ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                      : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-black'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#111111] uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-extrabold text-[#111111]">৳{priceMax} BDT</span>
            </div>
            <input
              type="range"
              min={1400}
              max={2500}
              step={50}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#111111] cursor-pointer"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-white rounded-2xl animate-pulse border border-[#E5E5E5]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E5E5] space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">No matching jerseys found</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto leading-relaxed">
                Try adjusting your filters or resetting to view all available matchday player kits.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F5]">
                <h3 className="text-sm font-black uppercase text-[#111111]">Filter Kits</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-[#888888] hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-6 flex-1">
                {/* Edition */}
                <div>
                  <label className="text-xs font-bold text-[#111111] uppercase block mb-2">Edition</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', ...editions].map((ed) => (
                      <button
                        key={ed}
                        onClick={() => setSelectedEdition(ed)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border ${
                          selectedEdition === ed
                            ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                            : 'bg-white text-[#555555] border-[#E5E5E5]'
                        }`}
                      >
                        {ed === 'all' ? 'All Editions' : ed}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="text-xs font-bold text-[#111111] uppercase block mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', ...sizes].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl border ${
                          selectedSize === s
                            ? 'bg-[#111111] text-[#F1600D] border-[#111111]'
                            : 'bg-white text-[#555555] border-[#E5E5E5]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E5E5E5] bg-[#F7F7F5] flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="w-1/3 py-3 rounded-xl border border-[#E5E5E5] text-xs font-bold text-[#555555]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-2/3 py-3 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase"
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

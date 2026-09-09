import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, TrendingUp, ArrowUpRight, Club as ClubIcon } from 'lucide-react';
import { Product, Club } from '../../types';
import { db } from '../../lib/db';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
  onSelectClub: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectClub,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('eleven_nation_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const popularKeywords = useMemo(() => {
    const list: string[] = [];
    (clubs || []).slice(0, 4).forEach((c) => {
      if (c && c.name) list.push(c.name);
    });
    (products || []).slice(0, 3).forEach((p) => {
      if (p && p.available_players && p.available_players[0]?.name) {
        list.push(p.available_players[0].name);
      }
    });
    return list.length > 0 ? list : ['Player Edition', 'Retro', 'Fan Edition'];
  }, [clubs, products]);

  useEffect(() => {
    if (isOpen) {
      db.getProducts().then((p) => setProducts(p || []));
      db.getClubs().then((c) => setClubs(c || []));
    }
  }, [isOpen]);

  // Keyboard shortcut ⌘K / Ctrl+K listener and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when search modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], clubs: [] };

    const matchedProducts = (products || []).filter((p) => {
      if (!p) return false;
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSeason = (p.season || '').toLowerCase().includes(q);
      const matchEdition = (p.edition_type || '').toLowerCase().includes(q);
      const matchPlayer = Array.isArray(p.available_players) && p.available_players.some((pl) => (pl?.name || '').toLowerCase().includes(q));
      return matchName || matchSeason || matchEdition || matchPlayer;
    });

    const matchedClubs = (clubs || []).filter((c) =>
      c && ((c.name || '').toLowerCase().includes(q) || (c.country || '').toLowerCase().includes(q) || (c.league || '').toLowerCase().includes(q))
    );

    return {
      products: matchedProducts,
      clubs: matchedClubs,
    };
  }, [query, products, clubs]);

  const handleSelectQuery = (keyword: string) => {
    setQuery(keyword);
    // Add to recent
    const updated = [keyword, ...recentSearches.filter((s) => s.toLowerCase() !== keyword.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('eleven_nation_recent_searches', JSON.stringify(updated));
  };

  const handleProductClick = (slug: string) => {
    if (query) {
      handleSelectQuery(query);
    }
    onSelectProduct(slug);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-16 px-2 sm:px-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Search Catalog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col max-h-[92vh] sm:max-h-[85vh] my-auto sm:my-0"
        >
          {/* Search Header Input */}
          <div className="p-3 sm:p-4 border-b border-[#E5E5E5] flex items-center gap-2 sm:gap-3 bg-[#F7F7F5]">
            <Search className="w-5 h-5 text-[#888888] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search club, player, or jersey edition..."
              className="w-full bg-transparent text-base font-medium text-[#111111] placeholder-[#888888] focus:outline-hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 text-[#888888] hover:text-[#111111] transition-colors rounded-full hover:bg-black/5 min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-[#333333] hover:text-black hover:border-black transition-colors shrink-0 shadow-2xs active:scale-95 min-h-[38px]"
              aria-label="Close search overlay"
            >
              <X className="w-4 h-4 sm:hidden" />
              <span className="sm:hidden">Close</span>
              <span className="hidden sm:inline">ESC</span>
            </button>
          </div>

          {/* Search Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-[#E5E5E5]">
            {/* If query is empty: show quick suggestions & recent searches */}
            {!query && (
              <div className="space-y-6">
                {/* Popular searches */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularKeywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => handleSelectQuery(kw)}
                        className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#F0F0EE] hover:bg-[#111111] hover:text-[#F1600D] transition-colors text-[#333333] flex items-center gap-1 min-h-[36px]"
                      >
                        <span>{kw}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">
                      <span>Recent Searches</span>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('eleven_nation_recent_searches');
                        }}
                        className="text-[10px] text-[#999999] hover:underline py-1 px-2"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleSelectQuery(kw)}
                          className="text-xs font-medium px-3 py-2 rounded-xl bg-white border border-[#E5E5E5] hover:border-black text-[#555555] transition-colors min-h-[36px]"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Collections Direct Links */}
                <div>
                  <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">
                    Featured Collections
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onNavigate('shop?edition=Player%20Edition');
                        onClose();
                      }}
                      className="p-3 text-left rounded-xl bg-[#F7F7F5] hover:bg-[#EAEAE8] transition-colors border border-[#E5E5E5]"
                    >
                      <span className="text-xs font-bold block text-[#111111]">Player Editions</span>
                      <span className="text-[10px] text-[#777777]">Match-spec slim cuts</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('retro');
                        onClose();
                      }}
                      className="p-3 text-left rounded-xl bg-[#F7F7F5] hover:bg-[#EAEAE8] transition-colors border border-[#E5E5E5]"
                    >
                      <span className="text-xs font-bold block text-[#111111]">Retro Vault</span>
                      <span className="text-[10px] text-[#777777]">90s & 2000s Grails</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('worldcup');
                        onClose();
                      }}
                      className="p-3 text-left rounded-xl bg-[#F7F7F5] hover:bg-[#EAEAE8] transition-colors border border-[#E5E5E5] xs:col-span-2 sm:col-span-1"
                    >
                      <span className="text-xs font-bold block text-[#111111]">World Cup 2026</span>
                      <span className="text-[10px] text-[#777777]">International kits</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* If query has search results */}
            {query && (
              <div className="space-y-6 pt-2">
                {/* Matched Clubs */}
                {searchResults.clubs.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ClubIcon className="w-3.5 h-3.5" />
                      <span>Clubs ({searchResults.clubs.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.clubs.map((club) => (
                        <button
                          key={club.id}
                          onClick={() => {
                            onSelectClub(club.slug);
                            onClose();
                          }}
                          className="px-3 py-2 rounded-xl bg-[#F7F7F5] hover:bg-[#111111] hover:text-white transition-colors border border-[#E5E5E5] text-xs font-bold flex items-center gap-2 min-h-[38px]"
                        >
                          <span>{club.name}</span>
                          <span className="text-[10px] opacity-70 font-normal">{club.league}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Products */}
                <div>
                  <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">
                    Jerseys ({searchResults.products.length})
                  </div>

                  {searchResults.products.length === 0 ? (
                    <div className="text-center py-8 text-[#777777]">
                      <p className="text-sm font-semibold text-[#111111]">No matching kits found</p>
                      <p className="text-xs mt-1">Try searching for &apos;Real Madrid&apos;, &apos;Mbappé&apos;, &apos;Retro&apos;, or &apos;Barcelona&apos;.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.products.map((product) => {
                        const prodImages = Array.isArray(product.images) ? product.images : [];
                        const prodPlayers = Array.isArray(product.available_players) ? product.available_players : [];
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full p-2.5 rounded-xl hover:bg-[#F7F7F5] transition-colors flex items-center gap-3.5 text-left group"
                          >
                            <div className="w-14 h-16 bg-[#EBEBE8] rounded-lg overflow-hidden shrink-0 border border-[#E5E5E5]">
                              <img
                                src={prodImages[0]?.image_url || ''}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#777777] uppercase">
                                  {product.season} • {product.edition_type}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#111111] truncate group-hover:text-black">
                                {product.name}
                              </h4>
                              <div className="text-xs text-[#666666] truncate mt-0.5">
                                {prodPlayers.length > 0 ? (
                                  <span>
                                    Players: {prodPlayers.map((p) => p.name).slice(0, 3).join(', ')}...
                                  </span>
                                ) : (
                                  <span>Custom Name & Number Available</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-[#111111] block">
                                ৳{product.base_price}
                              </span>
                              {product.compare_at_price && (
                                <span className="text-[11px] text-[#888888] line-through block">
                                  ৳{product.compare_at_price}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-[#F7F7F5] border-t border-[#E5E5E5] text-[11px] text-[#777777] flex items-center justify-between px-4 sm:px-5">
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-white border border-[#DDD] rounded text-[10px] font-mono">ESC</kbd> to close</span>
            <span className="sm:hidden text-[10px]">Tap Close or outside to exit</span>
            <button
              onClick={() => {
                onNavigate('shop');
                onClose();
              }}
              className="font-bold text-[#111111] hover:underline ml-auto"
            >
              Browse All Jerseys →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, ThumbsUp, Send } from 'lucide-react';
import { Review } from '../../types';
import { db } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState(user?.full_name || '');
  const [userComment, setUserComment] = useState('');
  const [playerBought, setPlayerBought] = useState('');

  const { success } = useToast();

  useEffect(() => {
    if (user?.full_name && !userName) {
      setUserName(user.full_name);
    }
  }, [user]);

  useEffect(() => {
    db.getReviews(productId).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    const newRev = await db.addReview({
      product_id: productId,
      user_id: user?.id || null,
      user_name: userName.trim(),
      rating: userRating,
      comment: userComment.trim(),
      player_edition_bought: playerBought.trim() || 'Player Edition Spec',
    });

    setReviews((prev) => [newRev, ...prev]);
    setShowAddForm(false);
    setUserComment('');
    setPlayerBought('');
    success('Review Submitted', 'Thank you for your feedback! Your review is now live.');
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 pt-6 border-t border-[#E5E5E5]">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#111111] uppercase tracking-tight">
            Customer Reviews ({reviews.length})
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-extrabold text-[#111111]">{avgRating} out of 5</span>
            <span className="text-xs text-[#777777]">• 100% Verified Bangladesh Buyers</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#111111] text-white hover:bg-black rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          {showAddForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="p-5 bg-[#F7F7F5] rounded-2xl border border-[#E5E5E5] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#111111]">
            Reviewing: {productName}
          </div>

          <div>
            <label className="text-xs font-bold text-[#666666] block mb-1">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#666666] block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Tanvir H."
                className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#666666] block mb-1">Jersey / Player Bought (Optional)</label>
              <input
                type="text"
                value={playerBought}
                onChange={(e) => setPlayerBought(e.target.value)}
                placeholder="e.g. Mbappé #9 (Size L)"
                className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#666666] block mb-1">Your Review & Fit Feedback</label>
            <textarea
              rows={3}
              required
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Tell us about the fabric quality, stitching, sizing fit, delivery experience..."
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-medium text-[#111111] focus:outline-hidden focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#111111] text-[#F1600D] rounded-xl text-xs font-black uppercase hover:bg-black transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Verified Review</span>
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-6 text-center text-xs text-[#777777]">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-6 bg-[#F7F7F5] rounded-2xl text-center text-xs text-[#777777]">
          Be the first to review this jersey!
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-[#E5E5E5]">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[#111111]">{rev.user_name}</span>
                  {rev.verified_purchase && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#888888]">
                  {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                {rev.player_edition_bought && (
                  <span className="text-[11px] text-[#777777] font-medium">
                    Purchased: {rev.player_edition_bought}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

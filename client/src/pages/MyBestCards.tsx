// client/src/pages/MyBestCards.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import CardSelectionModal from "../components/CardSelectionModal";
import { useAuth, useAuthFetch } from "../context/AuthContext";

type BestCard = {
  category: string;
  card_id: string;
  cashback_equiv_pct: number;
  card_name?: string;
  bank_id?: string;
  annual_fee?: number;
  img_url?: string;
};

type CardWithCategories = {
  card_id: string;
  card_name?: string;
  bank_id?: string;
  annual_fee?: number;
  img_url?: string;
  categories: Array<{
    category: string;
    cashback_equiv_pct: number;
  }>;
};

export default function MyBestCards() {
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const [data, setData] = useState<BestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fetchBest = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:3000/api/recommendations/my-cards?userId=${user.id}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to load recommendations");
      }
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Group data by card instead of by category
  const getCardGroups = (): CardWithCategories[] => {
    const cardMap = new Map<string, CardWithCategories>();

    data.forEach((item) => {
      if (!cardMap.has(item.card_id)) {
        cardMap.set(item.card_id, {
          card_id: item.card_id,
          card_name: item.card_name,
          bank_id: item.bank_id,
          annual_fee: item.annual_fee,
          img_url: item.img_url,
          categories: [],
        });
      }

      const card = cardMap.get(item.card_id)!;
      card.categories.push({
        category: item.category,
        cashback_equiv_pct: item.cashback_equiv_pct,
      });
    });

    // Sort categories by cashback percentage (highest first)
    cardMap.forEach((card) => {
      card.categories.sort((a, b) => b.cashback_equiv_pct - a.cashback_equiv_pct);
    });

    return Array.from(cardMap.values());
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Cards</h1>
          <p className="text-navy/70 text-sm">
            Based on the cards you own, here's the best one to use for each
            spending category.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition text-sm"
          >
            Edit My Cards
          </button>
          <Link
            to="/global-ranking"
            className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
          >
            View Global Ranking →
          </Link>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && (
        <div className="text-navy/60">Calculating your best cards…</div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-8 text-center">
          <Alert variant="info">
            You haven't added any cards yet. Click "Edit My Cards" to get started!
          </Alert>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-3 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition"
          >
            Add Your First Cards
          </button>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
          {getCardGroups().map((card) => {
            const isExpanded = expandedCards.has(card.card_id);
            const topCategory = card.categories[0]; // Highest cashback category
            
            return (
              <div
                key={card.card_id}
                className="rounded-xl border border-aqua/40 bg-white overflow-hidden"
              >
                {/* Card Header - Always Visible */}
                <button
                  onClick={() => toggleCard(card.card_id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-mint/20 transition text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {card.img_url && (
                      <img
                        src={card.img_url}
                        alt={card.card_name}
                        className="w-16 h-11 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {card.card_name || card.card_id}
                      </div>
                      <div className="text-xs text-navy/60">
                        {card.bank_id?.replace(/_/g, " ")}
                        {typeof card.annual_fee === "number" &&
                          ` • Annual fee: $${card.annual_fee}`}
                      </div>
                      {/* Show best category when collapsed */}
                      {!isExpanded && topCategory && (
                        <div className="mt-1 text-sm text-navy">
                          Best for <span className="font-medium">{topCategory.category}</span>: {topCategory.cashback_equiv_pct.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="text-navy/60 text-xl ml-3">
                    {isExpanded ? '−' : '+'}
                  </div>
                </button>

                {/* Categories Grid - Expandable */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-aqua/20 pt-3">
                    <div className="text-xs text-navy/60 mb-2 font-medium">
                      Cashback Rates by Category:
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {card.categories.map((cat) => (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between p-2 rounded-lg bg-mint/40"
                        >
                          <div className="text-xs uppercase tracking-wide text-navy/60 font-medium">
                            {cat.category}
                          </div>
                          <div className="text-sm font-semibold text-navy">
                            {cat.cashback_equiv_pct.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      <CardSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false);
          fetchBest(); // Refresh the best cards after saving
        }}
      />
    </main>
  );
}

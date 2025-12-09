// client/src/pages/MyBestCards.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import CardSelectionModal from "../components/CardSelectionModal";
import { useAuth, useAuthFetch } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type BestCard = {
  category: string;
  card_id: string;
  cashback_equiv_pct: number;
  card_name?: string;
  bank_id?: string;
  annual_fee?: number;
  img_url?: string;
};

type CardMeta = {
  card_id: string;
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
  const [allCards, setAllCards] = useState<CardMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // local source of truth for which cards are owned
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(
    () => ((user as any)?.ownedCards as string[]) || []
  );

  // Sync initial owned cards from AuthContext on first load
  useEffect(() => {
    const ctxOwned = (user as any)?.ownedCards as string[] | undefined;
    if (ctxOwned && ctxOwned.length && ownedCardIds.length === 0) {
      setOwnedCardIds(ctxOwned);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBest = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [recRes, cardsRes] = await Promise.all([
        authFetch(`${API_URL}/recommendations/my-cards?userId=${user.id}`),
        authFetch(`${API_URL}/cards`),
      ]);

      const recJson = await recRes.json();
      const cardsJson = await cardsRes.json();

      if (!recRes.ok) {
        throw new Error(recJson.message || "Failed to load recommendations");
      }
      if (!cardsRes.ok) {
        throw new Error(cardsJson.message || "Failed to load cards");
      }

      setData(recJson.data || []);
      setAllCards(cardsJson.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
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

  const formatBankName = (bankId?: string) => {
    if (!bankId) return "";
    return bankId
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  // All owned card metadata (for the "Cards I Own" section)
  const ownedCardMetas: CardMeta[] = ownedCardIds.map((id) => {
    const meta = allCards.find((c) => c.card_id === id);
    return (
      meta || {
        card_id: id,
        card_name: id,
      }
    );
  });

  // Build one group per OWNED card, then attach categories from recommendations
  const getCardGroups = (): CardWithCategories[] => {
    const cardMap = new Map<string, CardWithCategories>();

    // 1) Start with all owned cards so they ALWAYS show
    ownedCardIds.forEach((cardId) => {
      const meta = allCards.find((c) => c.card_id === cardId);
      cardMap.set(cardId, {
        card_id: cardId,
        card_name: meta?.card_name || cardId,
        bank_id: meta?.bank_id,
        annual_fee: meta?.annual_fee,
        img_url: meta?.img_url,
        categories: [],
      });
    });

    // 2) Overlay recommendation data
    data.forEach((item) => {
      if (!cardMap.has(item.card_id)) {
        cardMap.set(item.card_id, {
          card_id: item.card_id,
          card_name: item.card_name || item.card_id,
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

    // Sort categories inside each card (highest cashback first)
    cardMap.forEach((card) => {
      card.categories.sort((a, b) => b.cashback_equiv_pct - a.cashback_equiv_pct);
    });

    // Put cards with at least one category first
    return Array.from(cardMap.values()).sort((a, b) => {
      const aBest = a.categories[0]?.cashback_equiv_pct ?? 0;
      const bBest = b.categories[0]?.cashback_equiv_pct ?? 0;
      return bBest - aBest;
    });
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const cardGroups = getCardGroups();
  // 🔹 Only cards that actually have “best category” data
  const bestCards = cardGroups.filter((card) => card.categories.length > 0);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Cards</h1>
          <p className="text-navy/70 text-sm">
            See all the cards you own, then explore which ones are best for each
            spending category.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition text-sm"
          >
            Add / Edit My Cards
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
        <div className="text-navy/60">
          Loading your cards and recommendations…
        </div>
      )}

      {/* Empty state when no cards at all */}
      {!loading && !error && ownedCardIds.length === 0 && (
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-8 text-center">
          <Alert variant="info">
            You haven&apos;t added any cards yet. Click &quot;Add / Edit My
            Cards&quot; to get started!
          </Alert>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-3 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition"
          >
            Add Your First Cards
          </button>
        </div>
      )}

      {/* When user has cards */}
      {!loading && !error && ownedCardIds.length > 0 && (
        <>
          {/* Section 1: Cards I Own */}
          <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Cards I Own</h2>
              <span className="text-xs text-navy/60">
                {ownedCardIds.length} card
                {ownedCardIds.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {ownedCardMetas.map((card) => (
                <div
                  key={card.card_id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-aqua/30 bg-white"
                >
                  {card.img_url && (
                    <img
                      src={card.img_url}
                      alt={card.card_name}
                      className="w-16 h-11 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-sm md:text-base">
                      {card.card_name || card.card_id}
                    </div>
                    <div className="text-xs text-navy/60 mt-0.5">
                      {formatBankName(card.bank_id)}
                      {typeof card.annual_fee === "number" &&
                        ` • Annual fee: $${card.annual_fee}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-aqua underline hover:text-aqua/80"
              >
                Update my cards
              </button>
            </div>
          </section>

          {/* Section 2: Best Cards by Category */}
          <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Best Cards by Category</h2>
              <span className="text-xs text-navy/60">
                Only showing cards that are currently best for at least one
                category
              </span>
            </div>

            {bestCards.length === 0 ? (
              <div className="text-sm text-navy/60">
                We don&apos;t have category recommendations yet. Add some
                transactions in{" "}
                <Link to="/spending" className="text-aqua underline">
                  Spending
                </Link>{" "}
                so we can analyze where each card shines.
              </div>
            ) : (
              <div className="space-y-3">
                {bestCards.map((card) => {
                  const isExpanded = expandedCards.has(card.card_id);
                  const topCategory = card.categories[0]; // safe, we filtered length > 0

                  return (
                    <div
                      key={card.card_id}
                      className="rounded-xl border border-aqua/40 bg-white overflow-hidden"
                    >
                      {/* Card Header */}
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
                              {formatBankName(card.bank_id)}
                              {typeof card.annual_fee === "number" &&
                                ` • Annual fee: $${card.annual_fee}`}
                            </div>

                            {/* Highlight top category as a pill */}
                            {!isExpanded && topCategory && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-navy">
                                <span className="text-xs text-navy/60">
                                  Best for
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-aqua/20 text-[11px] uppercase tracking-wide font-semibold text-navy">
                                  {topCategory.category}
                                </span>
                                <span className="text-sm font-semibold text-navy">
                                  {topCategory.cashback_equiv_pct.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-navy/60 text-xl ml-3">
                          {isExpanded ? "−" : "+"}
                        </div>
                      </button>

                      {/* Categories Grid */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-aqua/20 pt-3">
                          <div className="text-xs text-navy/60 mb-2 font-medium">
                            Cashback rates by{" "}
                            <span className="uppercase tracking-wide">
                              category
                            </span>
                            :
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {card.categories.map((cat) => (
                              <div
                                key={cat.category}
                                className="flex items-center justify-between p-2 rounded-lg bg-mint/40"
                              >
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 text-[11px] uppercase tracking-wide text-navy font-semibold">
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
              </div>
            )}
          </section>
        </>
      )}

      <CardSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(selectedIds) => {
          setOwnedCardIds(selectedIds);
          setIsModalOpen(false);
          fetchBest(); // Refresh recommendations for new card set
        }}
      />
    </main>
  );
}

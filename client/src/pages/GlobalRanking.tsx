// client/src/pages/GlobalRanking.tsx
import { useEffect, useState, useMemo } from "react";
import Alert from "../components/Alert";
import { CategoryHelper } from "../utils/categoryHelper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const CATEGORY_OPTIONS = CategoryHelper.getCategories();

type GlobalCard = {
  card_id: string;
  card_name?: string;
  bank_id?: string;
  annual_fee?: number;
  img_url?: string;
  best_category: string;
  best_cashback_equiv_pct: number;
};

export default function GlobalRanking() {
  const [cards, setCards] = useState<GlobalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CategoryHelper.getDefaultCategory()
  );
  const [sortBy, setSortBy] = useState<"cashback" | "name">("cashback");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    async function fetchGlobal() {
      try {
        const url = new URL(`${API_URL}/recommendations/global`);
        url.searchParams.set("category", selectedCategory);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to load ranking");
        }
        if (!ignore) {
          setCards(json.data || []);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || "Failed to load ranking");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchGlobal();
    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    const result = [...cards].sort((a, b) => {
      if (sortBy === "cashback") {
        return b.best_cashback_equiv_pct - a.best_cashback_equiv_pct;
      } else {
        return (a.card_name || a.card_id).localeCompare(b.card_name || b.card_id);
      }
    });
    return result;
  }, [cards, sortBy]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Global Card Ranking</h1>
        <p className="text-navy/70 text-sm">
          All cards in our database, ranked by their best cashback-equivalent
          rate in any category.
        </p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {!error && (
        <>
          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center bg-white/70 border border-aqua/40 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <label htmlFor="category-filter" className="font-medium text-navy text-sm">
                Category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white border border-aqua/40 rounded-md focus:outline-none focus:ring-2 focus:ring-aqua"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="font-medium text-navy text-sm">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "cashback" | "name")}
                className="px-3 py-1.5 text-sm bg-white border border-aqua/40 rounded-md focus:outline-none focus:ring-2 focus:ring-aqua"
              >
                <option value="cashback">Highest Cashback</option>
                <option value="name">Card Name (A-Z)</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-navy/70">
              Showing {filteredAndSortedCards.length} {filteredAndSortedCards.length === 1 ? 'card' : 'cards'}
            </div>
          </div>

          <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-navy/60">Loading ranking...</div>
            ) : cards.length === 0 ? (
              <div className="text-center py-8 text-navy/60">
                No cards found for this category.
              </div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-aqua/40 text-navy/70">
                  <tr>
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Card</th>
                    <th className="py-2 pr-4">Bank</th>
                    <th className="py-2 pr-4">Best Category</th>
                    <th className="py-2 pr-4">Best Cashback</th>
                    <th className="py-2 pr-4">Annual Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCards.map((c, idx) => (
                    <tr key={c.card_id} className="border-b border-aqua/20 hover:bg-mint/20 transition">
                      <td className="py-2 pr-4">{idx + 1}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          {c.img_url && (
                            <img
                              src={c.img_url}
                              alt={c.card_name}
                              className="w-10 h-7 object-contain"
                            />
                          )}
                          <span>{c.card_name || c.card_id}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        {c.bank_id?.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="uppercase tracking-wide font-medium">
                          {CategoryHelper.formatLabel(c.best_category)}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="font-semibold text-aqua">
                          {c.best_cashback_equiv_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        ${typeof c.annual_fee === "number" ? c.annual_fee : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
}


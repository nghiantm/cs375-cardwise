// client/src/pages/PersonalRanking.tsx
import { useEffect, useState, useMemo } from "react";
import { useAuth, useAuthFetch } from "../context/AuthContext";
import Alert from "../components/Alert";

type CategoryRanking = {
  category: string;
  card_id: string;
  card_name?: string;
  bank_id?: string;
  cashback_equiv_pct: number;
  annual_fee?: number;
  img_url?: string;
};

export default function PersonalRanking() {
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const [rankings, setRankings] = useState<CategoryRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"cashback" | "category">("cashback");

  useEffect(() => {
    if (!user?.id) return;
    
    async function fetchRankings() {
      setLoading(true);
      try {
        const res = await authFetch(
          `http://localhost:3000/api/recommendations/my-cards?userId=${user?.id}`
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to load rankings");
        }
        
        setRankings(json.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load rankings");
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(rankings.map(r => r.category))].sort();
  }, [rankings]);

  // Filter and sort rankings
  const filteredAndSortedRankings = useMemo(() => {
    let result = rankings;
    
    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(r => r.category === selectedCategory);
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "cashback") {
        return b.cashback_equiv_pct - a.cashback_equiv_pct;
      } else {
        return a.category.localeCompare(b.category);
      }
    });
    
    return result;
  }, [rankings, selectedCategory, sortBy]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Personal Card Rankings</h1>
        <p className="text-navy/70 text-sm mt-1">
          Your best card for each spending category - ranked by cashback value
        </p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && (
        <div className="text-navy/60">Loading rankings…</div>
      )}

      {!loading && !error && rankings.length === 0 && (
        <Alert variant="info">
          You haven't added any cards yet. Add cards to see your personal rankings!
        </Alert>
      )}

      {!loading && !error && rankings.length > 0 && (
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
                <option value="all">All ({rankings.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()} ({rankings.filter(r => r.category === cat).length})
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
                onChange={(e) => setSortBy(e.target.value as "cashback" | "category")}
                className="px-3 py-1.5 text-sm bg-white border border-aqua/40 rounded-md focus:outline-none focus:ring-2 focus:ring-aqua"
              >
                <option value="cashback">Highest Cashback</option>
                <option value="category">Category (A-Z)</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-navy/70">
              Showing {filteredAndSortedRankings.length} {filteredAndSortedRankings.length === 1 ? 'result' : 'results'}
            </div>
          </div>

          <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-aqua/40 text-navy/70">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Card</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Cashback</th>
                  <th className="py-2 pr-4">Annual Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRankings.map((item, index) => (
                  <tr key={`${item.card_id}-${item.category}`} className="border-b border-aqua/20 hover:bg-mint/20 transition">
                    <td className="py-2 pr-4">{index + 1}</td>
                    <td className="py-2 pr-4">
                      <span className="uppercase tracking-wide font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        {item.img_url && (
                          <img
                            src={item.img_url}
                            alt={item.card_name}
                            className="w-10 h-7 object-contain"
                          />
                        )}
                        <span>{item.card_name || item.card_id}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {item.bank_id?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="font-semibold text-aqua">
                        {item.cashback_equiv_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      ${typeof item.annual_fee === "number" ? item.annual_fee : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}

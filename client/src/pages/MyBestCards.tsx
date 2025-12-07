// client/src/pages/MyBestCards.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
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

export default function MyBestCards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const [data, setData] = useState<BestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function fetchBest() {
      if (!user) return; // TypeScript guard
      
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
    }

    fetchBest();
  }, [navigate, user, authFetch]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Best Card by Category</h1>
          <p className="text-navy/70 text-sm">
            Based on the cards you own, here’s the best one to use for each
            spending category.
          </p>
        </div>
        <Link
          to="/global-ranking"
          className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
        >
          View Global Card Ranking →
        </Link>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && (
        <div className="text-navy/60">Calculating your best cards…</div>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert variant="info">
          We didn’t find any saved cards or rewards. Go back and select your
          cards first.
        </Alert>
      )}

      {!loading && !error && data.length > 0 && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {data.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-4 rounded-xl border border-aqua/40 bg-mint/40"
              >
                <div>
                  <div className="text-xs uppercase tracking-wide text-navy/60">
                    {item.category}
                  </div>
                  <div className="font-semibold">
                    {item.card_name || item.card_id}
                  </div>
                  <div className="text-xs text-navy/60">
                    {item.bank_id?.replace(/_/g, " ")}
                    {typeof item.annual_fee === "number" &&
                      ` • Annual fee: $${item.annual_fee}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {item.cashback_equiv_pct.toFixed(1)}%
                  </div>
                  <div className="text-xs text-navy/60">
                    cashback equivalent
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// client/src/pages/GlobalRanking.tsx
import { useEffect, useState } from "react";
import Alert from "../components/Alert";

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

  useEffect(() => {
    async function fetchGlobal() {
      try {
        const res = await fetch(
          "http://localhost:3000/api/recommendations/global"
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to load ranking");
        }
        setCards(json.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load ranking");
      } finally {
        setLoading(false);
      }
    }
    fetchGlobal();
  }, []);

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

      {loading && <div className="text-navy/60">Loading ranking…</div>}

      {!loading && !error && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 overflow-x-auto">
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
              {cards.map((c, idx) => (
                <tr key={c.card_id} className="border-b border-aqua/20">
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
                  <td className="py-2 pr-4">{c.best_category}</td>
                  <td className="py-2 pr-4">
                    {c.best_cashback_equiv_pct.toFixed(1)}%
                  </td>
                  <td className="py-2 pr-4">
                    ${typeof c.annual_fee === "number" ? c.annual_fee : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

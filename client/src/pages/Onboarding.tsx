// client/src/pages/Onboarding.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth, useAuthFetch } from "../context/AuthContext";

type Card = {
  _id: string;
  card_id: string;
  card_name: string;
  bank_id: string;
  img_url?: string;
  annual_fee?: number;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const authFetch = useAuthFetch();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingCards, setLoadingCards] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    async function fetchCards() {
      try {
        const res = await authFetch("http://localhost:3000/api/cards");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load cards");
        }
        setCards(data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load cards");
      } finally {
        setLoadingCards(false);
      }
    }
    fetchCards();
  }, [authFetch, authUser, navigate]);

  const toggleCard = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!authUser) return;
    setError(null);
    setSaving(true);

    try {
      const res = await authFetch(
        `http://localhost:3000/api/users/${authUser.id}/owned-cards`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cardIds: Array.from(selected) }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save cards");
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save cards");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Welcome! Let's Get Started</h1>
        <p className="text-navy/70 text-sm mt-2">
          Select the credit cards you currently own to get personalized recommendations.
          You can always add more cards later.
        </p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {loadingCards && (
        <div className="text-navy/60">Loading cards…</div>
      )}

      {!loadingCards && cards.length === 0 && (
        <Alert variant="info">No cards found in the database.</Alert>
      )}

      {!loadingCards && cards.length > 0 && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const isSelected = selected.has(card.card_id);
              return (
                <div
                  key={card._id}
                  onClick={() => toggleCard(card.card_id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition
                    ${
                      isSelected
                        ? "border-aqua bg-mint/40"
                        : "border-navy/20 bg-white hover:border-aqua/50"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCard(card.card_id)}
                      className="mt-1 accent-aqua"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      {card.img_url && (
                        <img
                          src={card.img_url}
                          alt={card.card_name}
                          className="w-full h-24 object-contain mb-2"
                        />
                      )}
                      <div className="text-sm font-semibold">
                        {card.card_name}
                      </div>
                      <div className="text-xs text-navy/60 mt-1">
                        {card.bank_id.replace(/_/g, " ")}
                      </div>
                      {typeof card.annual_fee === "number" && (
                        <div className="text-xs text-navy/60 mt-1">
                          Annual fee: ${card.annual_fee}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleSkip}
          disabled={saving}
          className="px-6 py-3 rounded-lg border border-navy/30 bg-white text-navy hover:bg-navy/5 transition disabled:opacity-50"
        >
          Skip for Now
        </button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-navy/60">
            {selected.size} card{selected.size !== 1 ? "s" : ""} selected
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="px-6 py-3 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth, useAuthFetch } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type Card = {
  _id: string;
  card_id: string;
  card_name: string;
  bank_id: string;
  img_url?: string;
  annual_fee?: number;
};

type UserInfo = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  ownedCards?: string[];
};

export default function MyCards() {
  const navigate = useNavigate();
  const { user: authUser, updateOwnedCards } = useAuth();
  const authFetch = useAuthFetch();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingCards, setLoadingCards] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log("MyCards render:", { authUser, user, selected });

  // 👉 Always fetch the latest user (including ownedCards) from the backend
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const res = await authFetch(`${API_URL}/users/${authUser.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load user info");
        }

        const apiUser = (data.data || data) as UserInfo;
        setUser(apiUser);

        if (apiUser.ownedCards && apiUser.ownedCards.length > 0) {
          setSelected(new Set(apiUser.ownedCards));
        }
      } catch (err: any) {
        console.error("Failed to load user info:", err);
        setError(err.message || "Failed to load user info");
      }
    };

    loadUser();
  }, [authUser, authFetch, navigate]);

  // Load all cards for selection
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await authFetch(`${API_URL}/cards`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load cards");
        }
        setCards(data.data || []);
      } catch (err: any) {
        console.error("Failed to load cards:", err);
        setError(err.message || "Failed to load cards");
      } finally {
        setLoadingCards(false);
      }
    };
    fetchCards();
  }, [authFetch]);

  const toggleCard = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const body = { cardIds: Array.from(selected) };

      const res = await authFetch(
        `${API_URL}/users/${user.id}/owned-cards`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save cards");
      }

      // keep auth context/localStorage in sync immediately
      updateOwnedCards(Array.from(selected));

      setSuccess("Cards saved! Calculating your best cards…");
      setTimeout(() => navigate("/my-best-cards"), 800);
    } catch (err: any) {
      console.error("Failed to save cards:", err);
      setError(err.message || "Failed to save cards");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Which cards do you own?</h1>
          <p className="text-navy/70 text-sm">
            Select all cards you currently have. We’ll tell you the best one to
            use for each spending category.
          </p>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loadingCards ? (
        <div className="text-navy/60">Loading cards…</div>
      ) : (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <button
                type="button"
                key={card._id}
                onClick={() => toggleCard(card.card_id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                  selected.has(card.card_id)
                    ? "border-aqua bg-mint/60"
                    : "border-aqua/40 bg-white"
                }`}
              >
                {card.img_url && (
                  <img
                    src={card.img_url}
                    alt={card.card_name}
                    className="w-12 h-8 object-contain"
                  />
                )}
                <div>
                  <div className="font-semibold text-sm">
                    {card.card_name}
                  </div>
                  <div className="text-xs text-navy/60">
                    {card.bank_id.replace(/_/g, " ")}
                    {typeof card.annual_fee === "number" &&
                      ` • Annual fee: $${card.annual_fee}`}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & See My Best Cards"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

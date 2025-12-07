// client/src/components/CardSelectionModal.tsx
import { useEffect, useState } from "react";
import Alert from "./Alert";
import { useAuth, useAuthFetch } from "../context/AuthContext";

type Card = {
  _id: string;
  card_id: string;
  card_name: string;
  bank_id: string;
  img_url?: string;
  annual_fee?: number;
};

type CardSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export default function CardSelectionModal({ isOpen, onClose, onSave }: CardSelectionModalProps) {
  const { user: authUser } = useAuth();
  const authFetch = useAuthFetch();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingCards, setLoadingCards] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Preselect owned cards
    if (authUser?.ownedCards && authUser.ownedCards.length > 0) {
      setSelected(new Set(authUser.ownedCards));
    }
  }, [authUser, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [authFetch, isOpen]);

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
    setSuccess(null);
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

      setSuccess("Cards saved successfully!");
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to save cards");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-aqua/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Select Your Cards</h2>
              <p className="text-navy/70 text-sm">
                Choose the credit cards you own
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-navy/60 hover:text-navy text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {loadingCards && (
            <div className="text-navy/60">Loading cards…</div>
          )}

          {!loadingCards && cards.length === 0 && (
            <Alert variant="info">No cards found in the database.</Alert>
          )}

          {!loadingCards && cards.length > 0 && (
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-aqua/40 flex items-center justify-between">
          <div className="text-sm text-navy/60">
            {selected.size} card{selected.size !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-navy/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selected.size === 0}
              className="px-4 py-2 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Cards"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

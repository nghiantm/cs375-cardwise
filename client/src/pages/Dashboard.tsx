// client/src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "cardwise_monthly_budget";

type CategoryKey = "travel" | "groceries" | "gas" | "online" | "pharma" | "other";

type BudgetState = Record<CategoryKey, string>;

const CATEGORY_FIELDS: Array<{ id: CategoryKey; label: string }> = [
  { id: "travel", label: "Travel" },
  { id: "groceries", label: "Groceries" },
  { id: "gas", label: "Gas" },
  { id: "online", label: "Online" },
  { id: "pharma", label: "Pharmacy" },
  { id: "other", label: "Other" },
];

const defaultBudget: BudgetState = {
  travel: "",
  groceries: "",
  gas: "",
  online: "",
  pharma: "",
  other: "",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetState>({ ...defaultBudget });

  /** Load spending plan (localStorage) */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BudgetState>;
        setBudgets((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.warn("Failed to load budget", err);
    }
  }, []);

  const totalMonthlyBudget = useMemo(() => {
    return CATEGORY_FIELDS.reduce((sum, field) => {
      const v = parseFloat(budgets[field.id]) || 0;
      return sum + v;
    }, 0);
  }, [budgets]);

  const categoriesPlanned = useMemo(() => {
    return CATEGORY_FIELDS.filter((f) => (parseFloat(budgets[f.id]) || 0) > 0).length;
  }, [budgets]);

  const ownedCardsCount =
    Array.isArray((user as any)?.ownedCards) ? (user as any).ownedCards.length : 0;

  /** Dashboard display modes */
  const hasSpending = totalMonthlyBudget > 0;
  const hasCards = ownedCardsCount > 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Greeting */}
      <section className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Hi, {user?.firstName || user?.email?.split("@")[0] || "there"}
          </h1>
          <p className="text-sm text-navy/70 mt-1">
            {!hasCards && !hasSpending
              ? "Welcome! Let's get you set up."
              : hasCards && !hasSpending
              ? "You're off to a good start. Add your monthly spending to unlock insights."
              : "Here’s a quick overview of your plan and cards."}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/spending"
            className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition text-sm"
          >
            Go to Spending
          </Link>
          <Link
            to="/my-best-cards"
            className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
          >
            Go to My Cards
          </Link>
        </div>
      </section>

      {/* ------------------------------- */}
      {/* 1️⃣ NEW USER — no cards + no spend */}
      {/* ------------------------------- */}
      {!hasCards && !hasSpending && (
        <section className="bg-white/80 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Welcome to CardWise 🎉</h2>
          <p className="text-sm text-navy/70">
            You're just two steps away from unlocking personalized credit card insights:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-navy/80">
            <li>
              Add the cards you own on the{" "}
              <Link className="text-aqua underline" to="/my-best-cards">
                My Cards
              </Link>{" "}
              page.
            </li>
            <li>
              Enter your estimated monthly spend on the{" "}
              <Link className="text-aqua underline" to="/spending">
                Spending
              </Link>{" "}
              page.
            </li>
          </ol>
        </section>
      )}

      {/* ------------------------------- */}
      {/* 2️⃣ USER HAS CARDS BUT NO SPENDING */}
      {/* ------------------------------- */}
      {hasCards && !hasSpending && (
        <section className="bg-white/80 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">You're almost there!</h2>
          <p className="text-sm text-navy/70">
            You’ve added{" "}
            <span className="font-semibold">{ownedCardsCount}</span>{" "}
            {ownedCardsCount === 1 ? "card" : "cards"} ✔  
            Now add a monthly spend plan so we can calculate the best card for every category.
          </p>

          <Link
            to="/spending"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-aqua text-white hover:bg-aqua/90 transition text-sm"
          >
            Enter Spending Plan →
          </Link>

          <div className="pt-4 border-t border-aqua/30">
            <h3 className="font-semibold text-md mb-2">Your cards</h3>
            <p className="text-sm text-navy/70">
              View or update them anytime on the{" "}
              <Link className="text-aqua underline" to="/my-best-cards">
                My Cards
              </Link>{" "}
              page.
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------- */}
      {/* 3️⃣ FULL DASHBOARD — user has both */}
      {/* ------------------------------- */}
      {hasSpending && (
        <>
          {/* KPI Row */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
              <p className="text-sm text-navy/70">Planned Monthly Spend</p>
              <p className="text-2xl font-semibold mt-1">
                ${totalMonthlyBudget.toFixed(2)}
              </p>
            </div>

            <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
              <p className="text-sm text-navy/70">Categories Planned</p>
              <p className="text-2xl font-semibold mt-1">{categoriesPlanned}</p>
            </div>

            <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
              <p className="text-sm text-navy/70">Cards Saved</p>
              <p className="text-2xl font-semibold mt-1">{ownedCardsCount}</p>
            </div>
          </section>

          {/* Spending breakdown */}
          <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Budget overview</h2>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CATEGORY_FIELDS.map((field) => {
                const val = parseFloat(budgets[field.id]) || 0;
                const share = (val / totalMonthlyBudget) * 100;

                return (
                  <div
                    key={field.id}
                    className="bg-white border border-aqua/30 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy">
                        {field.label}
                      </p>
                      <p className="text-xs text-navy/60">
                        {val > 0 ? `${share.toFixed(0)}%` : "—"}
                      </p>
                    </div>
                    <p className="text-xl font-semibold text-aqua">
                      ${val.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

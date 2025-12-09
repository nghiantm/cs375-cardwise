// client/src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useAuthFetch } from "../context/AuthContext";

const STORAGE_KEY = "cardwise_monthly_budget";

type CategoryKey =
  | "travel"
  | "groceries"
  | "gas"
  | "online"
  | "pharma"
  | "other";

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

  // Load saved monthly budget from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const response = await authFetch("http://localhost:3000/api/spending");

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.data || []);
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err instanceof TypeError) {
        setError("Unable to reach server. Please check your connection.");
      } else {
        setError(err.message || "Failed to load data");
      }
    } catch (err) {
      console.warn("Failed to load dashboard budget", err);
    }
  }, []);

  const totalMonthlyBudget = useMemo(() => {
    return CATEGORY_FIELDS.reduce((sum, field) => {
      const value = parseFloat(budgets[field.id]) || 0;
      return sum + value;
    }, 0);
  }, [budgets]);

  const categoriesPlanned = useMemo(() => {
    return CATEGORY_FIELDS.filter((field) => {
      const value = parseFloat(budgets[field.id]) || 0;
      return value > 0;
    }).length;
  }, [budgets]);

  const ownedCardsCount =
    (user as any)?.ownedCards && Array.isArray((user as any).ownedCards)
      ? (user as any).ownedCards.length
      : 0;

  const hasAnyData = totalMonthlyBudget > 0 || ownedCardsCount > 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Hi, {user?.firstName || user?.email?.split("@")[0] || "there"}
          </h1>
          <p className="text-sm text-navy/70 mt-1">
            {hasAnyData
              ? "Here’s a quick overview of your plan and cards."
              : "Let’s set up your first plan and add your cards."}
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
            to="/my-cards"
            className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
          >
            Go to My Cards
          </Link>
        </div>
      </section>

      {/* If no data yet, show a simple getting-started section */}
      {!hasAnyData && (
        <section className="bg-white/80 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Get started with CardWise</h2>
          <p className="text-sm text-navy/70">
            To unlock personalized insights, you just need to do two quick
            things:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-navy/80">
            <li>
              Set your expected monthly spend for each category on the{" "}
              <Link to="/spending" className="text-aqua underline">
                Spending
              </Link>{" "}
              page.
            </li>
            <li>
              Add the cards you own on the{" "}
              <Link to="/my-cards" className="text-aqua underline">
                My Cards
              </Link>{" "}
              page.
            </li>
          </ol>
        </section>
      )}

      {/* KPI Row – only depends on local budget + user cards */}
      {hasAnyData && (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <p className="text-sm text-navy/70">Planned Monthly Spend</p>
            <p className="text-2xl font-semibold mt-1">
              {totalMonthlyBudget > 0
                ? `$${totalMonthlyBudget.toFixed(2)}`
                : "—"}
            </p>
          </div>

          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <p className="text-sm text-navy/70">Categories Planned</p>
            <p className="text-2xl font-semibold mt-1">
              {categoriesPlanned || "—"}
            </p>
          </div>

          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <p className="text-sm text-navy/70">Cards Saved</p>
            <p className="text-2xl font-semibold mt-1">
              {ownedCardsCount || "—"}
            </p>
          </div>
        </section>
      )}

      {/* Budget overview – only if there is a plan */}
      {totalMonthlyBudget > 0 && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-lg">Budget overview</h2>
              <p className="text-sm text-navy/60">
                Your current monthly plan by category. Edit details in{" "}
                <Link to="/spending" className="text-aqua underline">
                  Spending
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {CATEGORY_FIELDS.map((field) => {
              const value = parseFloat(budgets[field.id]) || 0;
              const share =
                totalMonthlyBudget > 0
                  ? (value / totalMonthlyBudget) * 100
                  : 0;
              return (
                <div
                  key={field.id}
                  className="bg-white border border-aqua/30 rounded-xl p-4 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">
                      {field.label}
                    </p>
                    <p className="text-xs text-navy/60">
                      {value > 0 ? `${share.toFixed(0)}% of plan` : "—"}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-aqua">
                    ${value.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Simple cards summary – no API, just count */}
      {ownedCardsCount > 0 && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-lg">Your cards</h2>
              <p className="text-sm text-navy/60">
                You currently have{" "}
                <span className="font-semibold">{ownedCardsCount}</span>{" "}
                {ownedCardsCount === 1 ? "card" : "cards"} saved. View details
                or update them on the{" "}
                <Link to="/my-cards" className="text-aqua underline">
                  My Cards
                </Link>{" "}
                page.
              </p>
            </div>
            <Link
              to="/my-cards"
              className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
            >
              Manage Cards
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

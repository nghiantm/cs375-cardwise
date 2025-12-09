// client/src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  // Budget snapshot loaded from what the user set on Spending page
  const [budgets, setBudgets] = useState<BudgetState>({ ...defaultBudget });

  // Load saved monthly budget from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BudgetState>;
        setBudgets((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn("Failed to load saved budget", error);
    }
  }, []);

  const totalMonthlyBudget = useMemo(() => {
    return CATEGORY_FIELDS.reduce((sum, field) => {
      const value = parseFloat(budgets[field.id]) || 0;
      return sum + value;
    }, 0);
  }, [budgets]);

  const categoriesWithPlan = useMemo(() => {
    return CATEGORY_FIELDS.filter(
      (field) => (parseFloat(budgets[field.id]) || 0) > 0
    ).length;
  }, [budgets]);

  const ownedCardsCount =
    (user as any)?.ownedCards && Array.isArray((user as any).ownedCards)
      ? (user as any).ownedCards.length
      : 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Hi, {user?.firstName || user?.email?.split("@")[0] || "there"}
          </h1>
          <p className="text-sm text-navy/70 mt-1">
            Here&apos;s a snapshot of your plan, cards, and potential savings.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/spending"
            className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition text-sm"
          >
            Update Budget
          </Link>
          <Link
            to="/my-cards"
            className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition text-sm"
          >
            Manage Cards
          </Link>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <p className="text-sm text-navy/70">Planned Monthly Spend</p>
          <p className="text-2xl font-semibold mt-1">
            ${totalMonthlyBudget.toFixed(2)}
          </p>
        </div>

        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <p className="text-sm text-navy/70">Budget Categories</p>
          <p className="text-2xl font-semibold mt-1">{categoriesWithPlan}</p>
        </div>

        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <p className="text-sm text-navy/70">Cards Selected</p>
          <p className="text-2xl font-semibold mt-1">{ownedCardsCount}</p>
        </div>

        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <p className="text-sm text-navy/70">Simulator</p>
          <p className="text-sm mt-1 text-navy/70">
            Run details from the{" "}
            <Link to="/spending" className="underline text-aqua">
              Spending
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      {/* Budget Overview */}
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

        {totalMonthlyBudget === 0 ? (
          <div className="text-sm text-navy/60">
            You haven&apos;t set a monthly plan yet. Head to the{" "}
            <Link to="/spending" className="text-aqua underline">
              Spending
            </Link>{" "}
            page to create one.
          </div>
        ) : (
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
                      {share > 0 ? `${share.toFixed(0)}% of plan` : "—"}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-aqua">
                    ${value.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Best Cards section – simple link, no API calls */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-lg">Best cards this month</h2>
          <Link
            to="/my-cards"
            className="text-sm text-aqua underline hover:text-aqua/80"
          >
            View my best cards →
          </Link>
        </div>
        <p className="text-sm text-navy/60">
          See a breakdown of which card to use for each category on the{" "}
          <Link to="/my-cards" className="text-aqua underline">
            My Cards
          </Link>{" "}
          page.
        </p>
      </section>

      {/* Savings & growth preview – just points to simulator */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-lg">Savings &amp; growth</h2>
            <p className="text-sm text-navy/60">
              Run a detailed investment simulation based on your budget and best
              cards.
            </p>
          </div>
          <Link
            to="/spending"
            className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition text-sm"
          >
            Open Simulator
          </Link>
        </div>
        {totalMonthlyBudget === 0 ? (
          <p className="text-sm text-navy/60">
            Once you set a monthly plan, we&apos;ll help you see your potential
            savings and growth here.
          </p>
        ) : (
          <p className="text-sm text-navy/60">
            With a monthly plan of{" "}
            <span className="font-semibold text-aqua">
              ${totalMonthlyBudget.toFixed(2)}
            </span>
            , you can explore how much cashback you could earn and invest using
            the simulator.
          </p>
        )}
      </section>
    </main>
  );
}

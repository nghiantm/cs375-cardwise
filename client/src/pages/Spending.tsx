import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "../components/Alert";
import { useAuth, useAuthFetch } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

type BudgetStatus = {
  type: "success" | "error";
  message: string;
} | null;

type CategoryKey =
  | "travel"
  | "groceries"
  | "gas"
  | "online"
  | "pharma"
  | "other";

type BudgetState = Record<CategoryKey, string>;

type SimulationCard = {
  card_id: string;
  card_name?: string;
  bank_id?: string;
  img_url?: string;
  annual_fee?: number;
  cashback_equiv_pct?: number;
  saving: number;
};

type InvestmentResultEntry = {
  principal: number;
  interest: number;
  total: number;
};

type SimulationData = {
  cards: Record<string, SimulationCard>;
  investment_results: Record<string, InvestmentResultEntry> & {
    metadata?: {
      annual_rate: number;
      monthly_rate: number;
    };
  };
  total_monthly_savings: number;
  investment_summary?: {
    months: number;
    principal: number;
    interest: number;
    total: number;
  } | null;
};

const STORAGE_KEY = "cardwise_monthly_budget";

const CATEGORY_FIELDS: Array<{
  id: CategoryKey;
  label: string;
  example: string;
}> = [
  {
    id: "travel",
    label: "Travel",
    example: "Flights, hotels, rideshares",
  },
  {
    id: "groceries",
    label: "Groceries",
    example: "Supermarkets, meal kits",
  },
  {
    id: "gas",
    label: "Gas",
    example: "Fuel, tolls, transit",
  },
  {
    id: "online",
    label: "Online",
    example: "E-commerce, subscriptions",
  },
  {
    id: "pharma",
    label: "Pharmacy",
    example: "Prescriptions, wellness",
  },
  {
    id: "other",
    label: "Other",
    example: "Dining, entertainment, misc.",
  },
];

const defaultBudget: BudgetState = {
  travel: "",
  groceries: "",
  gas: "",
  online: "",
  pharma: "",
  other: "",
};

export default function Spending() {
  const { user } = useAuth();
  const authFetch = useAuthFetch();
  const [budgets, setBudgets] = useState<BudgetState>({ ...defaultBudget });
  const [initialBudget, setInitialBudget] = useState<BudgetState>({
    ...defaultBudget,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<BudgetStatus>(null);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const simulationRef = useRef<HTMLDivElement | null>(null);
  const sortedInvestmentEntries = useMemo(
    (): Array<[string, InvestmentResultEntry]> => {
      if (!simulation) return [];
      return Object.entries(simulation.investment_results)
        .filter(([key]) => key !== "metadata")
        .map(([key, value]): [string, InvestmentResultEntry] => [
          key,
          value as InvestmentResultEntry,
        ])
        .sort((a, b) => Number(a[0]) - Number(b[0]));
    },
    [simulation]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BudgetState>;
        setBudgets((prev) => {
          const next = { ...prev, ...parsed };
          setInitialBudget(next);
          return next;
        });
      } else {
        setInitialBudget({ ...defaultBudget });
      }
    } catch (error) {
      console.warn("Failed to load saved budget", error);
    }
  }, []);

  useEffect(() => {
    setIsDirty(JSON.stringify(budgets) !== JSON.stringify(initialBudget));
  }, [budgets, initialBudget]);

  const totalMonthlyBudget = useMemo(() => {
    return CATEGORY_FIELDS.reduce((sum, field) => {
      const value = parseFloat(budgets[field.id]) || 0;
      return sum + value;
    }, 0);
  }, [budgets]);

  const handleBudgetChange = (key: CategoryKey, value: string) => {
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }
    setBudgets((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    if (!isDirty) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
      setInitialBudget({ ...budgets });
      setStatus({
        type: "success",
        message: "Monthly budget saved. We'll remember this next time!",
      });
    } catch (error) {
      console.error("Failed to save budget", error);
      setStatus({
        type: "error",
        message: "We couldn't save your budget locally. Please try again.",
      });
    }
  };

  const buildSimulationQuery = () => {
    const params = new URLSearchParams();
    const paramMap: Record<CategoryKey, string> = {
      travel: "travel",
      groceries: "grocery",
      gas: "gas",
      online: "online",
      pharma: "pharma",
      other: "other",
    };

    Object.entries(budgets).forEach(([key, value]) => {
      const amount = parseFloat(value);
      if (!amount || amount <= 0) return;
      const paramKey = paramMap[key as CategoryKey];
      params.append(`${paramKey}_spending`, amount.toString());
    });
    return params;
  };

  const handleSimulation = async () => {
    if (!user) {
      setSimError("You need to be logged in to run the investment simulator.");
      return;
    }
    const params = buildSimulationQuery();
    if (!params.toString()) {
      setSimError("Enter at least one category budget before running a simulation.");
      return;
    }

    setSimLoading(true);
    setSimulation(null);
    setSimError(null);
    try {
      const url = `${API_URL}/users/${user.id}/investment-simulations?${params.toString()}`;
      const response = await authFetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to run simulation");
      }
      setSimulation(data.data);
      requestAnimationFrame(() => {
        simulationRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (error: any) {
      setSimulation(null);
      setSimError(error.message || "Failed to run simulation");
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Monthly Budget Planner</h1>
        <p className="text-sm text-navy/70">
          Map out how much you plan to spend in each category so CardWise can
          tailor card recommendations to your goals.
        </p>
      </header>

      {status && (
        <Alert variant={status.type === "success" ? "success" : "error"}>
          {status.message}
        </Alert>
      )}

      <section className="bg-white/70 border border-aqua/40 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-lg">Set your plan</h2>
            <p className="text-sm text-navy/60">
              Enter the monthly budget you want to keep on each card category.
            </p>
          </div>
          <div className="text-sm text-navy/70">
            Total Planned Budget:{" "}
            <span className="font-semibold text-aqua">
              ${totalMonthlyBudget.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORY_FIELDS.map((field) => (
              <div
                key={field.id}
                className="bg-white border border-navy/10 rounded-xl p-4 shadow-sm flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy whitespace-nowrap">
                    {field.label}
                  </h3>
                  <span className="text-xs text-navy/60 whitespace-nowrap">
                    ({field.example})
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy/70">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={budgets[field.id]}
                      onChange={(e) =>
                        handleBudgetChange(field.id, e.target.value)
                      }
                      placeholder="0.00"
                      className="w-28 rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aqua text-right"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isDirty}
              className={`px-4 py-2 rounded-lg transition ${
                isDirty
                  ? "bg-navy text-white hover:bg-aqua hover:text-navy"
                  : "bg-navy/15 text-navy/50 cursor-not-allowed"
              }`}
            >
              Save Monthly Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setBudgets({ ...defaultBudget });
                setInitialBudget({ ...defaultBudget });
                if (typeof window !== "undefined") {
                  localStorage.removeItem(STORAGE_KEY);
                }
                setStatus(null);
              }}
              className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/10 transition"
            >
              Clear All
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white/70 border border-aqua/40 rounded-lg p-6 space-y-4" ref={simulationRef}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-lg">Budget snapshot</h2>
          <p className="text-sm text-navy/60">
            See how your plan stacks up across categories.
          </p>
        </div>
        <div className="space-y-4">
          <div className="text-sm text-navy/70">
            Total Monthly Plan:{" "}
            <span className="text-lg font-semibold text-aqua">
              ${totalMonthlyBudget.toFixed(2)}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {CATEGORY_FIELDS.map((field) => (
              <div
                key={field.id}
                className="bg-white border border-aqua/30 rounded-xl p-3 flex flex-col gap-1"
              >
                <p className="text-xs uppercase tracking-wide text-navy/60">
                  {field.label}
                </p>
                <p className="text-lg font-semibold text-aqua">
                  ${budgets[field.id] ? Number(budgets[field.id]).toFixed(2) : "0.00"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/70 border border-aqua/40 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-lg">Investment simulation</h2>
            <p className="text-sm text-navy/60">
              Estimate annual savings per category and how they grow when invested.
            </p>
          </div>
          <button
            onClick={handleSimulation}
            disabled={simLoading || !user}
            className={`px-4 py-2 rounded-lg transition ${
              simLoading || !user
                ? "bg-navy/15 text-navy/40 cursor-not-allowed"
                : "bg-navy text-white hover:bg-aqua hover:text-navy"
            }`}
          >
            {simLoading ? "Calculating..." : "Run Simulation"}
          </button>
        </div>

        {simError && (
          <Alert variant="error">{simError}</Alert>
        )}

        {simLoading && (
          <div className="text-sm text-navy/60">Crunching the numbers...</div>
        )}

        {simulation && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-navy mb-3">Card recommendations</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(simulation.cards).map(([category, card]) => (
                  <div
                    key={category}
                    className="bg-white border border-navy/10 rounded-xl p-4 flex items-center gap-4"
                  >
                    {card.img_url && (
                      <img
                        src={card.img_url}
                        alt={card.card_name}
                        className="w-16 h-10 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs uppercase text-navy/60">{category}</p>
                      <p className="font-semibold text-navy">
                        {card.card_name || card.card_id}
                      </p>
                      <p className="text-sm text-navy/60">
                        {card.cashback_equiv_pct?.toFixed(1)}% back • Saves ${card.saving.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-1">
                Investment growth (QQQ{" "}
                {simulation.investment_results.metadata
                  ? `${(simulation.investment_results.metadata.annual_rate * 100).toFixed(1)}%`
                  : "10%"}
                )
              </h3>
              <p className="text-sm text-navy/60 mb-3">
                Monthly savings compounded monthly. Totals include principal + interest.
              </p>
              <div className="text-sm text-navy/70 mb-3">
                Monthly savings contributed:{" "}
                <span className="font-semibold text-aqua">
                  ${simulation.total_monthly_savings.toFixed(2)}
                </span>
              </div>

              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-aqua/40 text-navy/70">
                  <tr>
                    <th className="py-2 pr-4">Months</th>
                    <th className="py-2 pr-4">Principal</th>
                    <th className="py-2 pr-4">Interest</th>
                    <th className="py-2 pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvestmentEntries
                    .filter(([months]) => Number(months) > 1)
                    .map(([months, value]) => (
                      <tr key={months} className="border-b border-aqua/20 last:border-b-0">
                        <td className="py-2 pr-4">{months} months</td>
                        <td className="py-2 pr-4">${value.principal.toFixed(2)}</td>
                        <td className="py-2 pr-4">${value.interest.toFixed(2)}</td>
                        <td className="py-2 pr-4 text-aqua font-semibold">${value.total.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {simulation.investment_summary && (
                <div className="mt-3 text-sm text-navy/70">
                  After {simulation.investment_summary.months} months you would have invested $
                  {simulation.investment_summary.principal.toFixed(2)} and earned $
                  {simulation.investment_summary.interest.toFixed(2)} in growth for a total of $
                  {simulation.investment_summary.total.toFixed(2)}.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

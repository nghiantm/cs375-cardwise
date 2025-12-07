// client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = ["#0C2C47", "#8ADAB2", "#FFD580", "#97D3CD", "#2D5652"];

const BANK_COLORS: Record<string, string> = {
  Chase: "#0C2C47",
  "Bank of America": "#C0392B",
  "Capital One": "#1F618D",
  Discover: "#E67E22",
  "American Express": "#2E7D32",
};

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  date: string;
  merchant?: string;
  notes?: string;
  cardUsed?: string;
  createdAt?: string;
}

interface CategorySpend {
  category: string;
  value: number;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "month" | "ytd" | "year">("month");

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/spending");

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
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on date range
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      
      switch (dateRange) {
        case "month":
          // Current month
          return transactionDate.getMonth() === currentMonth &&
                 transactionDate.getFullYear() === currentYear;
        
        case "ytd":
          // Year to date (Jan 1 to today)
          return transactionDate.getFullYear() === currentYear &&
                 transactionDate <= now;
        
        case "year":
          // Entire current year
          return transactionDate.getFullYear() === currentYear;
        
        case "all":
        default:
          // All time
          return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate total spend
  const totalSpend = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate spend by category
  const categorySpend: CategorySpend[] = Object.entries(
    filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  // Find top category
  const topCategory = categorySpend.length > 0 ? categorySpend[0].category : "—";

  // Calculate daily spend based on date range
  const getDailySpendData = () => {
    // Group transactions by date
    const dateGroups = filteredTransactions.reduce((acc, t) => {
      const date = t.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Sort dates and get all unique dates
    const sortedDates = Object.keys(dateGroups).sort();
    
    if (sortedDates.length === 0) return [];

    // Create daily spend data
    return sortedDates.map(dateStr => {
      const date = new Date(dateStr);
      const dayTransactions = dateGroups[dateStr];

      const cardSpends = dayTransactions.reduce((acc, t) => {
        if (t.cardUsed) {
          acc[t.cardUsed] = (acc[t.cardUsed] || 0) + t.amount;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...cardSpends,
        // Ensure all cards have a value (0 if no spending)
        ...Object.fromEntries(
          Object.keys(BANK_COLORS).map(card => [card, cardSpends[card] || 0])
        )
      };
    });
  };

  const dailySpend = getDailySpendData();

  // Get recent 5 transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, 5);

  // Calculate best card by category (most spending in each category)
  const bestCardsByCategory = Object.entries(
    filteredTransactions.reduce((acc, t) => {
      if (!t.cardUsed) return acc;
      
      if (!acc[t.category]) {
        acc[t.category] = {};
      }
      acc[t.category][t.cardUsed] = (acc[t.category][t.cardUsed] || 0) + t.amount;
      return acc;
    }, {} as Record<string, Record<string, number>>)
  )
    .map(([category, cards]) => {
      const bestCard = Object.entries(cards).sort((a, b) => b[1] - a[1])[0];
      return {
        category,
        cardName: bestCard[0],
        amount: bestCard[1]
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4); // Top 4 categories

  // Get date range label
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "month": return "This Month";
      case "ytd": return "Year to Date";
      case "year": return "This Year";
      case "all": return "All Time";
      default: return "This Month";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      {/* Top Controls */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Hi, User</h1>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "all" | "month" | "ytd" | "year")}
            className="px-3 py-1.5 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 cursor-pointer"
          >
            <option value="month">This Month</option>
            <option value="ytd">Year to Date</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <Link
            to="/spending"
            className="px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
          >
            View Spending
          </Link>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <div className="text-sm text-navy/70">Total Spend</div>
          <div className="text-2xl font-semibold mt-1">
            {loading ? "..." : `$${totalSpend.toFixed(2)}`}
          </div>
        </div>
        
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <div className="text-sm text-navy/70">Top Category</div>
          <div className="text-2xl font-semibold mt-1">
            {loading ? "..." : topCategory}
          </div>
        </div>
        
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <div className="text-sm text-navy/70">Transactions</div>
          <div className="text-2xl font-semibold mt-1">
            {loading ? "..." : filteredTransactions.length}
          </div>
        </div>
        
        <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
          <div className="text-sm text-navy/70">Cards Used</div>
          <div className="text-2xl font-semibold mt-1">
            {loading ? "..." : new Set(filteredTransactions.map(t => t.cardUsed).filter(Boolean)).size}
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Content */}
      <section className="grid lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* PIE CHART */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Spend by Category</h2>
              <div className="text-sm text-navy/70">{getDateRangeLabel()}</div>
            </div>

            {loading ? (
              <div className="h-56 flex items-center justify-center text-navy/60">
                Loading...
              </div>
            ) : categorySpend.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-navy/60">
                No spending data for this period
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpend as any[]}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      {categorySpend.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Spend"]} 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* LINE CHART */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Spending Over Time</h2>
              <div className="text-sm text-navy/70">{getDateRangeLabel()}</div>
            </div>

            {loading ? (
              <div className="h-56 flex items-center justify-center text-navy/60">
                Loading...
              </div>
            ) : dailySpend.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-navy/60">
                No spending data for this period
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySpend as any} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Spend"]} />
                    <Legend />

                    {/* Dynamically render lines for each card */}
                    {Object.keys(BANK_COLORS).map(cardName => (
                      <Line 
                        key={cardName}
                        type="monotone" 
                        dataKey={cardName} 
                        stroke={BANK_COLORS[cardName]} 
                        strokeWidth={2} 
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Transactions</h2>
              <Link to="/spending" className="underline hover:text-aqua text-sm">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-navy/60">Loading...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-navy/60">
                No transactions yet. <Link to="/spending" className="underline text-aqua">Add one!</Link>
              </div>
            ) : (
              <ul className="divide-y divide-aqua/30">
                {recentTransactions.map((transaction) => (
                  <li key={transaction._id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{transaction.merchant || transaction.category}</div>
                      <div className="text-sm text-navy/70">
                        {transaction.category} • {transaction.cardUsed}
                      </div>
                    </div>
                    <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* BEST CARDS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Most Used Card by Category</h2>
            
            {loading ? (
              <div className="py-8 text-center text-navy/60">Loading...</div>
            ) : bestCardsByCategory.length === 0 ? (
              <div className="py-8 text-center text-navy/60 text-sm">
                No data yet. Start adding transactions!
              </div>
            ) : (
              <ul className="space-y-2">
                {bestCardsByCategory.map((item) => (
                  <li
                    key={item.category}
                    className="flex items-center justify-between p-2 rounded-lg bg-mint/60"
                  >
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-navy/80 text-right">
                      {item.cardName}
                      <span className="block text-xs text-navy/60">
                        ${item.amount.toFixed(2)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* OFFERS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Offers & Perks</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <div className="font-medium">Chase: 5% back on Dining</div>
                <div className="text-navy/70">Activate this quarter to maximize restaurant spend.</div>
              </li>
              <li>
                <div className="font-medium">Discover: 5% on Online Shopping</div>
                <div className="text-navy/70">Earn elevated rewards on select online merchants.</div>
              </li>
              <li>
                <div className="font-medium">Bank of America: Travel bonus offer</div>
                <div className="text-navy/70">Extra points on flights and hotels this month.</div>
              </li>
            </ul>
          </div>

          {/* ALERTS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Alerts</h2>
            <ul className="space-y-2 text-sm">
              <li>You would earn <b>3× more</b> on Dining by using <b>Chase Sapphire Preferred</b>.</li>
              <li>You’re close to your <b>Groceries</b> budget for this month.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

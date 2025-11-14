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
import {
  MOCK_CATEGORY_SPEND,
  MOCK_DAILY_SPEND,
  MOCK_BEST_CARDS,
} from "../data/mockDashboard";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = ["#0C2C47", "#8ADAB2", "#FFD580", "#97D3CD", "#2D5652"];

const BANK_COLORS: Record<string, string> = {
  Chase: "#0C2C47",
  "Bank of America": "#C0392B",
  "Capital One": "#1F618D",
  Discover: "#E67E22",
};

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      {/* Top Controls */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Hi, User</h1>

        <div className="flex gap-3">
          <button className="px-3 py-1.5 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20">
            This Month ▾
          </button>

          <Link
            to="/add-statements"
            className="px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
          >
            Add Statements
          </Link>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Total Spend", "Top Category", "Rewards Earned", "Budget Progress"].map((t, i) => (
          <div key={i} className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="text-sm text-navy/70">{t}</div>
            <div className="text-2xl font-semibold mt-1">—</div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <section className="grid lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* PIE CHART */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Spend by Category</h2>
              <div className="text-sm text-navy/70">This Month</div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_SPEND}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {MOCK_CATEGORY_SPEND.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Spend"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LINE CHART */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Spending Over Time</h2>
              <div className="text-sm text-navy/70">Last 7 Days</div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DAILY_SPEND} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Spend"]} />
                  <Legend />

                  <Line type="monotone" dataKey="Chase" stroke={BANK_COLORS["Chase"]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Bank of America" stroke={BANK_COLORS["Bank of America"]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Capital One" stroke={BANK_COLORS["Capital One"]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Discover" stroke={BANK_COLORS["Discover"]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Transactions</h2>
              <a className="underline hover:text-aqua text-sm" href="#">
                View all
              </a>
            </div>

            <ul className="divide-y divide-aqua/30">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Merchant {i + 1}</div>
                    <div className="text-sm text-navy/70">Dining • Chase</div>
                  </div>
                  <div className="font-medium">$—</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* BEST CARDS */}
          <div className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Best Card by Category</h2>
            <ul className="space-y-2">
              {MOCK_BEST_CARDS.map((item) => (
                <li
                  key={item.category}
                  className="flex items-center justify-between p-2 rounded-lg bg-mint/60"
                >
                  <span>{item.category}</span>
                  <span className="text-sm text-navy/80 text-right">
                    {item.cardName}
                    <span className="block text-xs text-navy/60">{item.bank}</span>
                  </span>
                </li>
              ))}
            </ul>
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

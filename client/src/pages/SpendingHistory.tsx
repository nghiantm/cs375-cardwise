import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";

// Development mode: Backend uses hardcoded user when USE_DEV_AUTH=true
// Production mode: Backend requires JWT token in Authorization header

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  date: string;
  merchant?: string;
  notes?: string;
  cardUsed?: string;
  createdAt?: string;  // Timestamp when transaction was added
  updatedAt?: string;  // Timestamp when transaction was last updated
}

export default function SpendingHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
    merchant: "",
    notes: "",
    cardUsed: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search, Sort, and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCard, setFilterCard] = useState("");

  // Fetch all transactions on component mount
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
        setError(err.message || "Failed to load transactions");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setSubmitError("Please enter a valid amount");
      return;
    }

    if (!formData.category) {
      setSubmitError("Please select a category");
      return;
    }

    if (!formData.cardUsed) {
      setSubmitError("Please select a card");
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/spending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date,
          merchant: formData.merchant || undefined,
          notes: formData.notes || undefined,
          cardUsed: formData.cardUsed || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add transaction");
      }

      // Success - show message, refresh list and reset form
      setSuccessMessage("Transaction added to spending history!");
      setShowAddForm(false);
      setFormData({
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0],
        merchant: "",
        notes: "",
        cardUsed: "",
      });
      fetchTransactions(); // Reload the list

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);

    } catch (err: any) {
      if (err.message === "Failed to fetch" || err instanceof TypeError) {
        setSubmitError("Unable to reach server. Please check your connection.");
      } else {
        setSubmitError(err.message || "Failed to add transaction");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Filter, search, and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = [...transactions];

    // Search filter (searches in merchant, category, notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.merchant?.toLowerCase().includes(query)) ||
        (t.category.toLowerCase().includes(query)) ||
        (t.notes?.toLowerCase().includes(query)) ||
        (t.cardUsed?.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Card filter
    if (filterCard) {
      filtered = filtered.filter(t => t.cardUsed === filterCard);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        comparison = dateB - dateA;
      } else if (sortBy === "amount") {
        comparison = b.amount - a.amount;
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

  // Get unique categories and cards from transactions for filter dropdowns
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category))).sort();
  const uniqueCards = Array.from(new Set(transactions.map(t => t.cardUsed).filter(Boolean))).sort();


  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Spending History</h1>
        <div className="flex gap-3">
          <Link
            to="/add-statements"
            className="px-4 py-2 rounded-lg border border-navy/30 bg-white text-navy hover:bg-aqua/20 transition"
          >
            📄 Upload Statement
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
          >
            {showAddForm ? "Cancel" : "+ Add Transaction"}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="relative">
          <Alert variant="success">
            {successMessage}
          </Alert>
          <button
            onClick={() => setSuccessMessage("")}
            className="absolute top-2 right-2 text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search, Sort, and Filter Controls */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-4">
          
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search by merchant, category, card, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="w-full rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm"
            >
              <option value="date">Sort by: Date</option>
              <option value="amount">Sort by: Amount</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm"
            >
              <option value="desc">{sortBy === "date" ? "Newest First" : "Highest First"}</option>
              <option value="asc">{sortBy === "date" ? "Oldest First" : "Lowest First"}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Card Filter */}
          <div>
            <select
              value={filterCard}
              onChange={(e) => setFilterCard(e.target.value)}
              className="w-full rounded-lg border border-navy/30 px-3 py-2 bg-white text-sm"
            >
              <option value="">All Cards</option>
              {uniqueCards.map(card => (
                <option key={card} value={card}>{card}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || filterCategory || filterCard) && (
            <div className="md:col-span-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("");
                  setFilterCard("");
                }}
                className="w-full px-3 py-2 rounded-lg border border-navy/30 bg-white text-navy text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition"
              >
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Add Transaction Form */}
      {showAddForm && (
        <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Add New Transaction</h2>

          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="e.g. 42.50"
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Dining">Dining</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Travel">Travel</option>
                  <option value="Gas">Gas</option>
                  <option value="Online Shopping">Online Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                />
              </div>

              {/* Card Used */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Card Used *</label>
                <select
                  value={formData.cardUsed}
                  onChange={(e) => handleChange("cardUsed", e.target.value)}
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                  required
                >
                  <option value="">Select Card</option>
                  <option value="Chase">Chase</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Capital One">Capital One</option>
                  <option value="Discover">Discover</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>

              {/* Merchant */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Merchant (Optional)</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => handleChange("merchant", e.target.value)}
                  placeholder="e.g. Starbucks"
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Add a description"
                  className="rounded-lg border border-navy/30 p-2 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition disabled:opacity-50"
            >
              {submitLoading ? "Adding..." : "Add Transaction"}
            </button>
          </form>
        </section>
      )}

      {/* Transaction List */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>
          {!loading && transactions.length > 0 && (
            <span className="text-sm text-navy/60">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-8 text-navy/60">Loading transactions...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-8 text-navy/60">
            No transactions yet. Add your first transaction above!
          </div>
        )}

        {!loading && !error && transactions.length > 0 && filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-navy/60">
            No transactions match your search or filters. Try adjusting your criteria.
          </div>
        )}

        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-navy/20 hover:border-aqua/60 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-navy">
                      {transaction.merchant || transaction.category}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-aqua/20 text-navy">
                      {transaction.category}
                    </span>
                  </div>
                  <div className="text-sm text-navy/60 mt-1">
                    {formatDate(transaction.date)}
                    {transaction.cardUsed && ` • ${transaction.cardUsed}`}
                  </div>
                  {transaction.notes && (
                    <div className="text-sm text-navy/50 mt-1">{transaction.notes}</div>
                  )}
                </div>
                <div className="text-lg font-semibold text-navy">
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}

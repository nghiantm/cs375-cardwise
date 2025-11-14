import { useState } from "react";

export default function AddStatements() {
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <h1 className="text-2xl font-semibold mb-4">Add Statements</h1>

      {/* Upload Section */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Upload Statement</h2>
        <p className="text-sm text-navy/70">
          Upload a PDF or CSV from your bank. We’ll automatically parse your spending data.
        </p>

        <label className="block w-full">
          <input
            type="file"
            accept=".pdf,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-lg border border-navy/30 bg-white p-2"
          />
        </label>

        {file && (
          <p className="text-sm mt-1 text-navy/80">
            Selected: <b>{file.name}</b>
          </p>
        )}

        <button
          className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
        >
          Upload & Process
        </button>
      </section>

      {/* Manual Entry Section */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Add a Transaction Manually</h2>

        <div className="grid gap-4 md:grid-cols-2">

          {/* Bank Select */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Bank</label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="rounded-lg border border-navy/30 p-2 bg-white"
            >
              <option value="">Select Bank</option>
              <option>Chase</option>
              <option>Bank of America</option>
              <option>Capital One</option>
              <option>Discover</option>
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 42.50"
              className="rounded-lg border border-navy/30 p-2 bg-white"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-navy/30 p-2 bg-white"
            >
              <option value="">Select Category</option>
              <option>Dining</option>
              <option>Groceries</option>
              <option>Travel</option>
              <option>Gas</option>
              <option>Online Shopping</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short description"
              className="rounded-lg border border-navy/30 p-2 bg-white"
            />
          </div>
        </div>

        <button
          className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
        >
          Add Transaction
        </button>
      </section>

    </main>
  );
}

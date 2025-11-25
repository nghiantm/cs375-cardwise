import { useState } from "react";
import { Link } from "react-router-dom";

export default function AddStatements() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    // TODO: Implement file upload to backend
    alert(`File ${file.name} will be uploaded and processed`);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Upload Bank Statements</h1>
        <Link
          to="/spending"
          className="text-aqua hover:underline text-sm"
        >
          ← Back to Spending History
        </Link>
      </div>

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
          onClick={handleUpload}
          className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition"
        >
          Upload & Process
        </button>
      </section>

      {/* Info Section */}
      <section className="bg-mint/30 border border-aqua/40 rounded-2xl p-6">
        <h3 className="font-semibold mb-2">Supported Formats</h3>
        <ul className="text-sm text-navy/70 space-y-1 list-disc list-inside">
          <li>PDF bank statements</li>
          <li>CSV export files</li>
          <li>Supported banks: Chase, Bank of America, Capital One, Discover, American Express</li>
        </ul>
      </section>

    </main>
  );
}

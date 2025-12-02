// client/src/pages/AddStatements.tsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AddStatements() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    setMessage(null);

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("statement", file);

      const res = await fetch("http://localhost:3000/api/statements/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage(data?.message || "Failed to upload file.");
        setUploading(false);
        return;
      }

      setMessage(`Uploaded & processed: ${file.name}`);
      setFile(null);
      setUploading(false);

    } catch (err) {
      console.error(err);
      setMessage("Network error. Please make sure the server is running.");
      setUploading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Upload Bank Statements</h1>
        <Link to="/spending" className="text-aqua hover:underline text-sm">
          ← Back to Spending History
        </Link>
      </div>

      {/* Upload Section */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Upload Statement</h2>
        <p className="text-sm text-navy/70">
          Upload a PDF or CSV from your bank. We’ll automatically extract and categorize your transactions.
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
            Selected file: <b>{file.name}</b>
          </p>
        )}

        {message && (
          <p className="text-sm mt-1 text-red-500 font-medium">{message}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload & Process"}
        </button>
      </section>

      {/* Info Section */}
      <section className="bg-mint/30 border border-aqua/40 rounded-2xl p-6">
        <h3 className="font-semibold mb-2">Supported Formats</h3>
        <ul className="text-sm text-navy/70 space-y-1 list-disc list-inside">
          <li>PDF bank statements</li>
          <li>CSV export files</li>
          <li>
            Supported banks: Chase, Bank of America, Capital One, Discover,
            American Express
          </li>
        </ul>
      </section>
    </main>
  );
}

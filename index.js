import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("biasa");
  const [result, setResult] = useState("");

  async function submit(e) {
    e.preventDefault();
    setResult("Mengirim...");

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, status })
    });

    if (res.ok) {
      setMessage("");
      setName("");
      setStatus("biasa");
      setResult("Terkirim. Terima kasih.");
    } else {
      setResult("Gagal mengirim.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-800">
          Kotak Kritik & Saran
        </h1>

        <input
          type="text"
          placeholder="Nama (opsional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
        />

        <textarea
          required
          placeholder="Kritik / Saran"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded p-2 h-28"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="biasa">Biasa</option>
          <option value="penting">Penting</option>
          <option value="sangat_penting">Sangat Penting</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          Kirim
        </button>

        {result && (
          <p className="text-sm text-center text-gray-600">{result}</p>
        )}
      </form>
    </main>
  );
}

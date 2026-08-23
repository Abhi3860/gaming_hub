import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/api.js";

export default function AddGameModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    playtime_hours: 0,
    status: "Backlog",
    cover_image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/library/manual", {
        title: form.title,
        playtime_hours: parseFloat(form.playtime_hours) || 0,
        status: form.status,
        cover_image_url: form.cover_image_url || null,
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || "Failed to add game.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md bg-bg-900 border border-bg-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-700">
          <h2 className="text-white font-semibold">Add a game manually</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Elden Ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Playtime (hrs)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.playtime_hours}
                onChange={(e) => update("playtime_hours", e.target.value)}
                className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option>Backlog</option>
                <option>Playing</option>
                <option>Completed</option>
                <option>Dropped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Cover image URL
            </label>
            <input
              value={form.cover_image_url}
              onChange={(e) => update("cover_image_url", e.target.value)}
              className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="https://..."
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-500 transition text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Add to library
          </button>
        </form>
      </div>
    </div>
  );
}
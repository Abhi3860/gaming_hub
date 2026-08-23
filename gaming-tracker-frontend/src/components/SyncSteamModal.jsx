import { useState } from "react";
import { X, Loader2, RefreshCw } from "lucide-react";
import api from "../api/api.js";

export default function SyncSteamModal({ onClose, onSynced }) {
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post(`/library/sync/steam/${steamId}`);
      setMessage(data.message);
      onSynced();
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || "Failed to sync Steam library.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md bg-bg-900 border border-bg-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-700">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <RefreshCw size={16} className="text-accent-400" />
            Sync Steam library
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Steam ID (SteamID64)
            </label>
            <input
              required
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="7656119..."
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-500 transition text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sync now
          </button>
        </form>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import api from "../api/api.js";
import Sidebar from "../components/Sidebar.jsx";
import GameCard from "../components/GameCard.jsx";
import AddGameModal from "../components/AddGameModal.jsx";
import SyncSteamModal from "../components/SyncSteamModal.jsx";
import GameDetailsModal from "../components/GameDetailsModal.jsx";

export default function Dashboard() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/library/");
      setLibrary(data);
    } catch (err) {
      setError("Could not load your library.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return library;
    return library.filter((entry) =>
      entry.game.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [library, search]);

  const totalHours = useMemo(
    () => library.reduce((sum, e) => sum + (e.playtime_hours || 0), 0),
    [library]
  );

  function refreshSelectedEntry() {
    fetchLibrary();
  }

  return (
    <div className="flex bg-bg-950 min-h-screen">
      <Sidebar onAddGame={() => setShowAddModal(true)} onSyncSteam={() => setShowSyncModal(true)} />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Library</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {library.length} games · {totalHours.toFixed(1)} hours tracked
            </p>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your library..."
              className="bg-bg-900 border border-bg-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-64 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading your library...
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-zinc-500 text-sm">
            No games found. Try adding one manually or syncing your Steam library.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((entry) => (
            <GameCard
              key={entry.game_id}
              entry={entry}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>
      </main>

      {showAddModal && (
        <AddGameModal onClose={() => setShowAddModal(false)} onAdded={fetchLibrary} />
      )}

      {showSyncModal && (
        <SyncSteamModal onClose={() => setShowSyncModal(false)} onSynced={fetchLibrary} />
      )}

      {selectedEntry && (
        <GameDetailsModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onPlaytimeUpdated={refreshSelectedEntry}
        />
      )}
    </div>
  );
}
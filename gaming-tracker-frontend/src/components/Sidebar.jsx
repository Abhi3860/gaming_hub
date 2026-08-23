import { Gamepad2, LayoutGrid, LogOut, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({ onAddGame, onSyncSteam }) {
  const { logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-bg-900 border-r border-bg-700 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-bg-700">
        <div className="bg-accent-600/20 p-2 rounded-lg">
          <Gamepad2 className="text-accent-400" size={20} />
        </div>
        <span className="text-white font-semibold">GameVault</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-800 text-white text-sm font-medium">
          <LayoutGrid size={16} />
          Library
        </div>

        <button
          onClick={onAddGame}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-bg-800 hover:text-white text-sm transition"
        >
          <Plus size={16} />
          Add game manually
        </button>

        <button
          onClick={onSyncSteam}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-bg-800 hover:text-white text-sm transition"
        >
          <RefreshCw size={16} />
          Sync Steam library
        </button>
      </nav>

      <div className="px-3 py-4 border-t border-bg-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 text-sm transition"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
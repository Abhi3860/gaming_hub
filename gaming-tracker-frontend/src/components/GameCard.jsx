import { Clock, Gamepad2 } from "lucide-react";

const STATUS_STYLES = {
  Backlog: "bg-zinc-500/15 text-zinc-300",
  Playing: "bg-emerald-500/15 text-emerald-400",
  Completed: "bg-accent-500/15 text-accent-400",
  Dropped: "bg-red-500/15 text-red-400",
};

export default function GameCard({ entry, onClick }) {
  const { game, playtime_hours, status } = entry;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Backlog;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-bg-900 border border-bg-700 rounded-xl overflow-hidden hover:border-accent-500/60 hover:-translate-y-0.5 transition-all duration-150"
    >
      <div className="aspect-[3/4] bg-bg-800 relative overflow-hidden">
        {game.cover_image_url ? (
          <img
            src={game.cover_image_url}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Gamepad2 size={40} />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur ${statusStyle}`}
        >
          {status}
        </span>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-white truncate">{game.title}</h3>
        <div className="flex items-center gap-1 mt-1.5 text-zinc-400 text-xs">
          <Clock size={12} />
          <span>{playtime_hours} hrs played</span>
        </div>
      </div>
    </button>
  );
}
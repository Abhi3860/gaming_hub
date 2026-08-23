import { useEffect, useState } from "react";
import { X, Clock, Loader2, ImagePlus, StickyNote, Plus } from "lucide-react";
import api, { resolveAssetUrl } from "../api/api.js";

export default function GameDetailsModal({ entry, onClose, onPlaytimeUpdated }) {
  const { game, playtime_hours, status } = entry;

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteImage, setNoteImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [addHours, setAddHours] = useState("");
  const [updatingPlaytime, setUpdatingPlaytime] = useState(false);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  async function fetchNotes() {
    setNotesLoading(true);
    setNotesError("");
    try {
      const { data } = await api.get(`/notes/game/${game.id}`);
      setNotes(data);
    } catch (err) {
      setNotesError("Could not load notes for this game.");
    } finally {
      setNotesLoading(false);
    }
  }

  async function handleSubmitNote(e) {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setSubmitError("");
    setSubmitting(true);

    // Backend expects multipart/form-data with Form(...) fields + optional File
    const formData = new FormData();
    formData.append("title", noteTitle);
    if (noteContent) formData.append("content", noteContent);
    if (noteImage) formData.append("image", noteImage);

    try {
      const { data } = await api.post(`/notes/game/${game.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotes((prev) => [data, ...prev]);
      setNoteTitle("");
      setNoteContent("");
      setNoteImage(null);
    } catch (err) {
      setSubmitError(err.response?.data?.detail?.toString() || "Failed to save note.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddPlaytime(e) {
    e.preventDefault();
    const hours = parseFloat(addHours);
    if (!hours) return;
    setUpdatingPlaytime(true);
    try {
      await api.patch(`/library/${game.id}/playtime`, { added_hours: hours });
      setAddHours("");
      onPlaytimeUpdated();
    } catch (err) {
      // silent fail is fine here, could surface a toast
    } finally {
      setUpdatingPlaytime(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8">
      <div className="w-full max-w-2xl max-h-full overflow-y-auto bg-bg-900 border border-bg-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-bg-700">
          <div className="flex gap-4">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-bg-800 shrink-0">
              {game.cover_image_url && (
                <img
                  src={game.cover_image_url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{game.title}</h2>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400">
                {status}
              </span>
              <div className="flex items-center gap-1 mt-2 text-zinc-400 text-sm">
                <Clock size={14} />
                {playtime_hours} hours played
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Playtime quick-add */}
        <form
          onSubmit={handleAddPlaytime}
          className="flex items-center gap-2 px-5 py-3 border-b border-bg-700"
        >
          <input
            type="number"
            step="0.1"
            min="0"
            value={addHours}
            onChange={(e) => setAddHours(e.target.value)}
            placeholder="Add hours played"
            className="flex-1 bg-bg-800 border border-bg-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <button
            type="submit"
            disabled={updatingPlaytime}
            className="flex items-center gap-1 bg-bg-800 hover:bg-bg-700 border border-bg-700 text-white text-sm px-3 py-1.5 rounded-lg transition disabled:opacity-60"
          >
            {updatingPlaytime ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Update playtime
          </button>
        </form>

        {/* New note form */}
        <form onSubmit={handleSubmitNote} className="p-5 border-b border-bg-700 space-y-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <StickyNote size={16} className="text-accent-400" />
            Add a note
          </h3>
          <input
            required
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title"
            className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write something about this game..."
            rows={3}
            className="w-full bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer hover:text-white">
              <ImagePlus size={16} />
              {noteImage ? noteImage.name : "Attach a screenshot"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setNoteImage(e.target.files?.[0] || null)}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-accent-600 hover:bg-accent-500 transition text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Save note
            </button>
          </div>

          {submitError && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
        </form>

        {/* Notes list */}
        <div className="p-5">
          <h3 className="text-sm font-medium text-white mb-3">Notes</h3>

          {notesLoading && (
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading notes...
            </div>
          )}

          {notesError && <p className="text-red-400 text-sm">{notesError}</p>}

          {!notesLoading && !notesError && notes.length === 0 && (
            <p className="text-zinc-500 text-sm">No notes yet for this game.</p>
          )}

          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-bg-800 border border-bg-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-sm font-medium">{note.title}</h4>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                {note.content && (
                  <p className="text-zinc-400 text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                )}
                {note.image_url && (
                  <img
                    src={resolveAssetUrl(note.image_url)}
                    alt={note.title}
                    className="mt-2 rounded-lg max-h-64 object-cover border border-bg-700"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
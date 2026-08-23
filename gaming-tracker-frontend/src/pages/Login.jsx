import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password);
      }
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail?.toString() ||
          "Something went wrong. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent-600/20 p-3 rounded-2xl mb-3">
            <Gamepad2 className="text-accent-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">GameVault</h1>
          <p className="text-zinc-500 text-sm mt-1">Track every game you own and play</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-900 border border-bg-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex mb-6 bg-bg-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-sm rounded-md transition ${
                mode === "login" ? "bg-accent-600 text-white" : "text-zinc-400"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 text-sm rounded-md transition ${
                mode === "register" ? "bg-accent-600 text-white" : "text-zinc-400"
              }`}
            >
              Create account
            </button>
          </div>

          <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="you@example.com"
          />

          <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 bg-bg-800 border border-bg-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            placeholder="••••••••"
          />

          {error && (
            <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-500 transition text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account & sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
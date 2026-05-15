import { useState } from "react";
import { loginUser, setupAdmin } from "../api/authApi";
import banner from "../assets/banner.png";
import logo from "../assets/logo.png";
import { LogIn, ShieldCheck, AlertCircle, Settings, UserPlus } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123"); //password will be admin123
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSetupMode) {
        const res = await setupAdmin({ username, password });
        if (res.success) {
          setSuccess("Admin created! You can now sign in.");
          setIsSetupMode(false);
        } else {
          setError(res.message);
        }
      } else {
        const res = await loginUser({ username, password });
        if (res.success) {
          localStorage.setItem("auth", JSON.stringify({ token: res.token, username: res.username }));
          window.location.href = "/";
        } else {
          setError(res.message || "Invalid credentials");
        }
      }
    } catch (err) {
      setError("Connection failure. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" style={{ backgroundImage: `url(${banner})`, backgroundSize: "cover", backgroundPosition: "bottom" }}>
      <div className="w-full max-w-md">
        <div className="relative z-10 flex items-center justify-center mb-5">
          <img src={logo} alt="Logo" />
        </div>

        {/* Login/Setup Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 transition-all">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            {isSetupMode ? <UserPlus size={20} className="text-blue-600" /> : <LogIn size={20} className="text-blue-600" />}
            {isSetupMode ? "Initial System Setup" : "Operator Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-shake">
                <AlertCircle size={18} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm">
                <ShieldCheck size={18} />
                <p className="font-medium">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold"
                placeholder="Enter username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-bold tracking-tight">{isSetupMode ? "Initialize Administrator" : "Authenticate Session"}</span>
                  {isSetupMode ? <Settings size={18} /> : <LogIn size={18} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsSetupMode(!isSetupMode)}
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isSetupMode ? "Back to Sign In" : "First time setup? Click here"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 TE Tech Solution &bull; Production Environment
        </p>
      </div>
    </div>
  );
}

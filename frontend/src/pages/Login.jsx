import { useState } from "react";
import { loginUser } from "../api/authApi";
import logo from "../assets/logo.png";
import banner from "../assets/banner.png"; // Replace with your banner image path

export default function Login() {
  const [email, setEmail] = useState("admin@tetech.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null); // clear previous errors
    try {
      const res = await loginUser({ email, password });

      if (res.success) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(res.user));
        window.location.href = "/";
      } else {
        setError("Invalid credentials"); // show error
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen items-center justify-center bg-gray-900 relative"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Login Card */}
      <div className="relative bg-gray-800 p-8 rounded-xl shadow-lg w-96 text-white flex flex-col items-center z-10">
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-24 h-24 mb-4" />

        {/* Title */}
        <h1 className="text-2xl font-bold mb-1 text-center">
          Smart Street Light Monitoring System
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-400 mb-6 text-center">
          Powered by TE Tech Solution
        </p>
        {/* Error Alert Panel */}
        {error && (
          <div className="bg-red-900 p-3 mb-4 rounded w-full">
            <p className="font-bold">⚠ Login Error</p>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Email Input */}
        <input
          className="w-full p-3 mb-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          className="w-full p-3 mb-4 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          className={`w-full p-3 rounded font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

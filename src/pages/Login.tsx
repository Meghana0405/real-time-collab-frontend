import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("🚀 Login button clicked");

    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    try {
      setLoading(true);

      console.log("🌐 API URL:", import.meta.env.VITE_API_URL);

      const response = await api.post("/login", {
        email,
        password
      });

      console.log("📦 Full response:", response);

      const data = response.data;

      if (data.token && data.userId) {
        setToken(data.token);

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        console.log("✅ Login success");

        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed ❌");
      }

    } catch (error: any) {
      console.log("❌ ERROR OBJECT:", error);

      // 🔥 IMPORTANT DEBUG INFO
      console.log("👉 Request URL was:", error.config?.baseURL);

      if (error.code === "ERR_NETWORK") {
        alert("❌ Cannot connect to backend\n\nPossible reasons:\n1. Backend sleeping (Render)\n2. Wrong API URL\n3. CORS issue");
        return;
      }

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Server error ⚠️";

      alert(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login 🔐</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Connecting..." : "Login"}
      </button>

      <br /><br />

      <p>
        Don't have an account?
        <span
          style={{
            color: "skyblue",
            cursor: "pointer",
            marginLeft: "5px"
          }}
          onClick={() => navigate("/register")}
        >
          Register here
        </span>
      </p>
    </div>
  );
}

export default Login;
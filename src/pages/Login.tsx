import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios"; // ✅ USE YOUR GLOBAL API

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    try {

      console.log("🔄 Sending login request...");

      const response = await api.post("/login", {
        email,
        password
      });

      const data = response.data;

      console.log("✅ Login response:", data);

      if (data.token && data.userId) {

        setToken(data.token);

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        console.log("💾 Saved userId:", data.userId);

        navigate("/dashboard");

      } else {
        alert(data.message || "Login failed ❌");
      }

    } catch (error: any) {

      console.log("❌ Login error FULL:", error);

      if (error.code === "ERR_NETWORK") {
        alert("Cannot connect to server ❌\nBackend may be sleeping (Render)");
        return;
      }

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Server error ⚠️";

      alert(errorMsg);
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

      <button onClick={handleLogin}>
        Login
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
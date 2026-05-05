import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/editor";

import { useAuthStore } from "./store/authStore";
import Invite from "./pages/Invite";

function App() {

  const token = useAuthStore(
    (state) => state.token
  );

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Register />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            token
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />

        {/* EDITOR */}
        <Route
          path="/editor/:id"
          element={
            token
              ? <Editor />
              : <Navigate to="/" />
          }
        />

        {/* INVITE */}
        <Route
          path="/invite/:token"
          element={
            token
              ? <Invite />
              : <Navigate to="/" />
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;

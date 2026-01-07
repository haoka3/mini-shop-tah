import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Link to="">Trang bán</Link> | <Link to="admin">Admin</Link>
        </div>
        {user ? (
          <button onClick={() => signOut(auth)}>Đăng xuất</button>
        ) : (
          <Link to="login">Đăng nhập</Link>
        )}
      </header>

      <hr />

      <Routes>
        {/* ✅ TRANG MẶC ĐỊNH */}
        <Route index element={<Home />} />

        <Route path="login" element={<Login />} />

        <Route
          path="admin"
          element={user ? <Admin /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

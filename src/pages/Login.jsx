import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const login = async () => {
    if (!email || !pass) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Đăng nhập thành công, điều hướng đến trang admin
      nav("/admin");
    } catch (err) {
      // Xử lý lỗi và hiển thị thông báo
      let errorMessage = "Đăng nhập thất bại";
      if (err.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "Tài khoản không tồn tại";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Mật khẩu sai";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Email hoặc mật khẩu không đúng";
      } else {
        errorMessage = err.message || "Đăng nhập thất bại";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h2>Admin Login</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
          disabled={loading}
        />
        <input
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
          disabled={loading}
        />
        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang đăng nhập..." : "Login"}
        </button>
      </div>
      {error && (
        <div
          style={{
            padding: 12,
            backgroundColor: "#fee",
            color: "#c33",
            borderRadius: 4,
            marginTop: 8,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

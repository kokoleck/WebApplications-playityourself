import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function SignIn() {
  const [showRegister, setShowRegister] = useState(false);

  // סטייט התחברות
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // סטייט הרשמה
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const navigate = useNavigate();

  // פונקציית התחברות
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("התחברת בהצלחה!");
        localStorage.setItem("token", data.accessToken);

        // נבצע ניווט לדף הבית
        navigate("/");
      } else {
        alert(data.message || "שגיאת התחברות");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("שגיאה כללית בהתחברות");
    }
  };

  // פונקציית הרשמה
  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("נרשמת בהצלחה!");
        setShowRegister(false);
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
      } else {
        alert(data.message || "שגיאה בהרשמה");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("שגיאה כללית בהרשמה");
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <h1 className="logoTitle">
          PlayItYourself <span className="diceIcon">🎲</span>
        </h1>
        <p className="loginSubtitle">Made by you. Played by all.</p>

        {/* טופס התחברות */}
        <input
          type="email"
          placeholder="Email"
          className="loginInput"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="loginInput"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />

        <button className="loginButton" onClick={handleLogin}>
          Log in
        </button>

        <button className="loginButton google">
          <img src="/GoogleIcon.jpg" alt="google" className="googleIcon" />
          Log in with Google
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <button onClick={() => setShowRegister(true)} className="signupLink">
            Sign up
          </button>
        </p>
      </div>

      {/* מודאל הרשמה */}
      {showRegister && (
        <div className="modalOverlay">
          <div className="registerModal">
            <button onClick={() => setShowRegister(false)} className="closeModal">
              ✕
            </button>
            <h2 className="text-xl font-bold text-center">Sign up</h2>

            <input
              type="text"
              placeholder="User name"
              className="loginInput"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="loginInput"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="loginInput"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <button className="loginButton" onClick={handleRegister}>
              Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

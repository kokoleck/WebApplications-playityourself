import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import LogoPlayItYourself from "./assets/LogoPlayItYourself.png"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignIn() {
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const navigate = useNavigate();

  // ✅ התחברות אוטומטית אחרי redirect מ-Google עם token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      // מעבר אוטומטי לדף הבית בלי רענון
      navigate("/", { replace: true });
    }
  }, [navigate]); // הוספנו את ה-navigate כתלות כדי לוודא שהמעבר יקרה רק אחרי ש-navigate הושלם
  

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const handleLogin = async () => {
    if (!isValidEmail(loginEmail)) {
      alert("נא להזין כתובת אימייל תקינה");
      return;}
    try {
      console.log("Trying to login with:", { email: loginEmail, password: loginPassword });

      const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      console.log("data:", data);
      if (res.ok) {
        toast.success("התחברת בהצלחה!"); // השתמש ב-toast.success
        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("userId", data.user._id);

        setTimeout(() => { 
          navigate("/"); // מעבר אוטומטי אחרי 2 שניות
        }, 2000);
      } else {
        toast.error(data.message || "שגיאת התחברות"); // השתמש ב-toast.error
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("שגיאה כללית בהתחברות"); // השתמש ב-toast.error
    }
  };
  

  const handleRegister = async () => {
    if (!isValidEmail(registerEmail)) {
      alert("נא להזין כתובת אימייל תקינה");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/users/register", {
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

  const handleGoogleLogin = () => {
    window.open("http://localhost:3001/api/auth/google", "_self");
};

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <h1 className="logoTitle">  
        <div className="logoContainer">
        <img src={LogoPlayItYourself} alt="PlayItYourself " className="logoImage" />
        </div>
        </h1>
        <p className="loginSubtitle">Made by you. Played by all.</p>

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

        <button className="loginButton google" onClick={handleGoogleLogin}>
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

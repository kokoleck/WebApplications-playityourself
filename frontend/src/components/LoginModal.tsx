import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        alert("התחברת בהצלחה");

        onClose(); // סוגר את המודאל

        // מחכה קצת ואז עובר לדף הבית
        setTimeout(() => {
            onClose();       // סוגר את המודאל
            navigate("/");   // עובר לדף הבית
          }, 200);
      } else {
        alert(data.message || "שגיאה בהתחברות");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("שגיאה כללית בהתחברות");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-center">התחברות</h2>

        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        >
          התחבר
        </button>

        <button
          onClick={onClose}
          className="text-sm mt-4 text-gray-500 hover:underline block mx-auto"
        >
          סגור
        </button>
      </div>
    </div>
  );
};

export default LoginModal;

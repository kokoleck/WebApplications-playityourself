// src/pages/EditProfilePage.tsx
import { useState } from "react";
import "./EditProfilePage.css";

export default function EditProfilePage() {
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("יש להתחבר קודם");

    const formData = new FormData();
    formData.append("username", username);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const res = await fetch("http://localhost:3001/api/users/USER_ID", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("הפרופיל עודכן בהצלחה");
      } else {
        alert(data.message || "שגיאה בעדכון");
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  return (
    <div className="editProfileContainer">
      <div className="editProfileCard">
        <h1 className="editProfileTitle">Edit Your Profile</h1>

        <input
          type="text"
          placeholder="New username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="editInput"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setProfileImage(e.target.files ? e.target.files[0] : null)
          }
          className="editInput"
        />

        <button onClick={handleSave} className="saveButton">
          Save Changes
        </button>
      </div>
    </div>
  );
}

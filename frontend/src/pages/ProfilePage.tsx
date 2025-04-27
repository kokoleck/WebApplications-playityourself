import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProfilePage.css";


export default function ProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  

  const loggedInUserId = localStorage.getItem("userId");

  

  // שליפת פרטי משתמש
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();
        setUser(data);
        setEditUsername(data.username || ""); // בעת עריכה נתחיל עם השם הנוכחי
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);



  
  // שליפת פוסטים של המשתמש
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`/api/posts/user/${id}`);
        const data = await response.json();
        setUserPosts(data);
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
      }
    };

    if (id) {
      fetchUserPosts();
    }
  }, [id]);

  if (!user) return <div>Loading...</div>;

  // טיפול בשמירת עריכה
  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append("username", editUsername);
    if (newProfileImage) {
      formData.append("profileImage", newProfileImage);
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        alert("הפרופיל עודכן בהצלחה!");
      } else {
        alert("נכשל בעדכון הפרופיל");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // טיפול במחיקת פוסט
  const handleDeletePost = async (postId: string) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
  

      if (response.ok) {
        setUserPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        alert("הפוסט נמחק בהצלחה!");
      } else {
        alert("נכשל במחיקת הפוסט");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="profileWrapper">
      <div className="profileHeader">
        <img src={user.profileImage} alt="Profile" className="profileImage" />
        <div>
          <h2 className="profileUsername">{user.username}</h2>
          <p className="profileEmail">{user.email}</p>
        </div>
      </div>

      {/* אפשרות עריכה רק אם זה המשתמש עצמו */}
      {loggedInUserId === id && !editing && (
        <button onClick={() => setEditing(true)} className="editProfileButton">
          ערוך פרופיל
        </button>
      )}

<button onClick={() => navigate("/")} className="backHomeButton">
  חזרה לדף הבית
</button>


      {/* טופס עריכה */}
      {editing && (
        <div className="editProfileForm">
          <input
            type="text"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            placeholder="שם משתמש חדש"
          />
          <input
            type="file"
            onChange={(e) => setNewProfileImage(e.target.files?.[0] || null)}
          />
          <button onClick={handleSaveChanges}>שמור שינויים</button>
          <button onClick={() => setEditing(false)}>ביטול</button>
        </div>
      )}

{userPosts.length === 0 ? (
  <p>אין פוסטים להצגה.</p>
) : (
  userPosts.map((post) => (
    <div key={post._id} className="profilePostItem">
      <h4 className="profilePostTitle">{post.title}</h4>
      <p>{post.content}</p>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="profilePostImage"
        />
      )}
      <button onClick={() => handleDeletePost(post._id)} className="deletePostButton">
        🗑️ Delete
      </button> {/* אפשרות למחוק פוסט */}
    </div>
  ))
)}
      </div>
  );
}

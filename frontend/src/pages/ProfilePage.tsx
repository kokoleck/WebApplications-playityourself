// src/pages/ProfilePage.tsx
import { useParams } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { id } = useParams();

  const user = {
    id,
    username: "נועה כהן",
    email: "noa@example.com",
    profileImage: "/assets/default-profile.png",
  };

  const posts = [
    {
      id: "1",
      title: "משחק יצירתי",
      content: "זה המשחק שהכנתי עם הילדים!",
      image: "/uploads/sample.jpg",
    },
    {
      id: "2",
      title: "חידון שבועות",
      content: "כיף להעביר איתו ערב חג 🎉",
    },
  ];

  return (
    <div className="profileWrapper">
      <div className="profileHeader">
        <img src={user.profileImage} alt="Profile" className="profileImage" />
        <div>
          <h2 className="profileUsername">{user.username}</h2>
          <p className="profileEmail">{user.email}</p>
        </div>
      </div>

      <div className="profilePosts">
        <h3 className="profilePostsTitle">My posts</h3>
        {posts.map((post) => (
          <div key={post.id} className="profilePostItem">
            <h4 className="profilePostTitle">{post.title}</h4>
            <p>{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="profilePostImage"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import "./MainPage.css";

interface Post {
  id: string;
  username: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export default function MainPage() {
  const [showModal, setShowModal] = useState(false);

  const posts: Post[] = [
    {
      id: "1",
      username: "נועם",
      title: "משחק מטורף",
      content: "זה המשחק הכי כיף שהכנתי בחיים שלי!",
      image: "/uploads/sample.jpg",
      likes: 12,
      comments: 4,
    },
    {
      id: "2",
      username: "הילה",
      title: "חידון לכל המשפחה",
      content: "כיף לשחק בו עם הילדים",
      likes: 7,
      comments: 2,
    },
  ];

  return (
    <div className="pageWrapper">
      <div className="pageHeader">
        <h1 className="pageTitle">Discover New Fun</h1>
        <button onClick={() => setShowModal(true)} className="addPostButton">
          +
        </button>
      </div>

      {/* פוסטים */}
      {posts.map((post) => (
        <div key={post.id} className="postCard">
          <div className="postUsername">{post.username}</div>
          <div className="postTitle">{post.title}</div>
          <p>{post.content}</p>
          {post.image && (
            <img src={post.image} alt="post" className="postImage" />
          )}
          <div className="postFooter">
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments} Comments</span>
          </div>
        </div>
      ))}

      {/* מודאל */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button
              onClick={() => setShowModal(false)}
              className="closeButton"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-center">New post</h2>
            <input
              type="text"
              placeholder="Title"
              className="modalInput"
            />
            <textarea
              placeholder="Type here..."
              className="modalTextarea"
            />
            <input
              type="file"
              accept="image/*"
              className="modalFile"
            />
            <button className="modalButton">Post!</button>
          </div>
        </div>
      )}
    </div>
  );
}

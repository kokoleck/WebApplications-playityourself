// src/pages/PostPage.tsx
import { useParams } from "react-router-dom";
import "./PostPage.css";

export default function PostPage() {
  const { id } = useParams();

  const post = {
    id,
    username: "דניאל",
    title: "משחק מהאגדות",
    content: "חייבים לנסות אותו! מתאים לכל גיל.",
    image: "/uploads/sample.jpg",
    likes: 24,
  };

  const comments = [
    { id: "c1", username: "רותם", text: "מדהים!!" },
    { id: "c2", username: "אורן", text: "שיחקנו ונהנינו!" },
  ];

  return (
    <div className="postPageWrapper">
      <div className="postCardDetail">
        <h1 className="postTitle">{post.title}</h1>
        <p className="postAuthor"> Posted by {post.username}</p>
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="post" className="postImageDetail" />
        )}
        <p className="postLikes">❤️ {post.likes} Likes</p>
      </div>

      <div className="commentSection">
        <h2 className="commentsHeader">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.id} className="commentItem">
            <strong>{comment.username}:</strong> {comment.text}
          </div>
        ))}
        <textarea placeholder="Write a comment ..." className="commentTextarea" />
        <button className="commentButton">Send a comment </button>
      </div>
    </div>
  );
}

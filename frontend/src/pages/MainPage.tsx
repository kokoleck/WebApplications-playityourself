import { useState, useEffect } from "react";
import "./MainPage.css";
import axios from "axios";
import { log } from "console";

interface Post {
  _id: string;
  username: string;
  title: string;
  content: string;
  image?: string;
  likesCount: number;
  likedBy:string[];
  comments: number;
}
interface LikeResponse{
  likesCount: number;
  likedBy: string[];

}

export default function MainPage() {
  const [showModal, setShowModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);


  const onLike = async (postId: string) =>{
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("User is not logged in");
      return;
    }
    const response = await axios.patch<LikeResponse>(`http://localhost:3001/api/posts/${postId}`,
null,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    const like = response.data;
    const post = posts.find((post) => post._id === postId);
    if (post) {
      const updatedPost = { ...post, likesCount: like.likesCount, likedBy: like.likedBy };
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? updatedPost : p))
      );
    }
  }

  const handleCreatePost = async (postData: {
    owner: any;
    title: string;
    content: string;
    image?: File;
  }) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("User is not logged in");
        return;
      }

      let imageUrl: string | undefined;
      if (postData.image) {
        const formData = new FormData();
        formData.append("file", postData.image);

        const imageResponse = await axios.post("http://localhost:3001/api/files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        });
        imageUrl = (imageResponse.data as { url: string }).url;
        console.log("Uploaded Image URL:", imageUrl);
      }

      const postToSend: {
        title: string;
        content: string;
        image?: string | null; // Allow null if no image
      } = {
        title: postData.title,
        content: postData.content,
        image: imageUrl || null, // Send the imageUrl if available, otherwise null
      };


      console.log("Post to send:", postToSend);

      const response = await axios.post(
        "http://localhost:3001/api/posts",

        postToSend,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("Post creation response:", response.data);

      const newPost: Post = response.data as Post;
    
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      // setIsModalOpen(false);//
    } catch (error: any) {
      console.error("Error creating post:", error.response?.data || error);
      alert(`Failed to create post: ${error.response?.data?.message || "Unknown error"}`);
    }
    setShowModal(false);
    setPostTitle("");
    setPostContent("");
    setPostImage(null);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/posts");
        const data = await response.json();
        console.log("Fetched posts:", data);
        setPosts(data.posts || []); // Fallback למערך ריק במקרה של undefined
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]); // גם כאן fallback אם יש שגיאה
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="pageWrapper">
      <div className="pageHeader">
        <h1 className="pageTitle">Discover New Fun</h1>
        <button onClick={() => setShowModal(true)} className="addPostButton">
          +
        </button>
      </div>

      {/* פוסטים */}
      {Array.isArray(posts) &&
        posts.map((post) => (
          <div key={post._id} className="postCard">
            <div className="postUsername">{post.username}</div>
            <div className="postTitle">{post.title}</div>
            <p>{post.content}</p>
            {post.image && (
              <img src={post.image} alt="post" className="postImage" />
            )}
            <div className="postFooter">
              <span onClick={() =>onLike(post._id)}>❤️ {post.likesCount}</span>
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
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <textarea
              placeholder="Type here..."
              className="modalTextarea"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="modalFile"
              onChange={(e) =>
                setPostImage(e.target.files ? e.target.files[0] : null)
              }
            />
            <button
              className="modalButton"
              onClick={() =>
                handleCreatePost({
                  owner: "currentUser", // Replace with actual owner data
                  title: postTitle,
                  content: postContent,
                  image: postImage || undefined,
                })
              }
            >
              Post!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function setIsModalOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}


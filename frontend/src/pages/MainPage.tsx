  import { useState, useEffect } from "react";
  import "./MainPage.css";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import ProfileLogo from "./assets/ProfileLogo.png"; // תמונת הלוגו של המשתמש
  import LogoutLogo from "./assets/LogoutLogo.png"; // תמונת כפתור התנתקות

  interface Post {
    _id: string;
    username: string;
    title: string;
    content: string;
    image?: string;
    likesCount: number;
    likedBy: string[];
    commentsList: Array<{ comment: string; username: string }>;
  }

  interface LikeResponse {
    likesCount: number;
    likedBy: string[];
  }


  export default function MainPage() {
    const [showModal, setShowModal] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [postImage, setPostImage] = useState<File | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
    const [commentText, setCommentText] = useState<string>("");


    const navigate = useNavigate();

    const handleProfileRedirect = () => {
      const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage
      if (!userId) {
        alert("User ID not found");
        return;
      }
      navigate(`/profile/${userId}`); // ניווט לדף פרופיל של המשתמש
    };

    const handleLogout = () => {
      localStorage.removeItem("authToken"); // מסיר את ה-token
      navigate("/signin"); // ניווט לעמוד התחברות
    };




    const onLike = async (postId: string) => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("User is not logged in");
        return;
      }
      const response = await axios.patch<LikeResponse>(
        `http://localhost:3001/api/posts/${postId}`,
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
    };

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
          image?: string | null;
        } = {
          title: postData.title,
          content: postData.content,
          image: imageUrl || null,
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
          setPosts(data.posts || []);
        } catch (err) {
          console.error("Failed to fetch posts:", err);
          setPosts([]);
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

    {/* כפתור פרופיל */}
    <div className="leftButtons">
  <div className="userProfileLogo" onClick={handleProfileRedirect}>
    <img src={ProfileLogo} alt="User Profile" className="userLogoImage" />
  </div>

{/* כפתור התנתקות */}
<button onClick={handleLogout} className="logoutButton">
    <img src={LogoutLogo} alt="Logout" className="logoutIcon" />
    
  </button>
</div>
    

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
                <span onClick={() => onLike(post._id)}>❤️ {post.likesCount}</span>
                <span>💬 {post.commentsList?.length || 0} Comments</span>
                <button
                  onClick={() => {
                    setCommentText("");
                    setShowCommentModal(post._id);
                  }}
                >
                  Add Comment
                </button>
              </div>

              {showCommentModal === post._id && (
                <div className="commentModal">
                  <textarea
                    placeholder="התגובה שלך..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
                  />
                  <button
                    onClick={async () => {
                      if (!commentText.trim()) {
                        alert("אי אפשר לשלוח תגובה ריקה");
                        return;
                      }
                      const authToken = localStorage.getItem("authToken");
                      if (!authToken) {
                        alert("User is not logged in");
                        return;
                      }
                      try {
                        await axios.post(
                          "http://localhost:3001/api/comments",
                          {
                            postId: post._id,
                            comment: commentText,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${authToken}`,
                            },
                          }
                        );
                        console.log("תגובה נשלחה:", commentText);
                        setCommentText("");
                        setShowCommentModal(null);
                      } catch (err: any) {
                        console.error("Error posting comment:", err.response?.data || err);
                        alert("שליחת התגובה נכשלה");
                      }
                    }}
                    style={{ marginRight: "8px" }}
                  >
                    שלח תגובה
                  </button>
                  <button onClick={() => setShowCommentModal(null)}>בטל</button>
                </div>
              )}
            </div>
          ))}

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
                    owner: "currentUser",
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

  import { useState, useEffect } from "react";
  import "./MainPage.css";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import ProfileLogo from "./assets/ProfileLogo.png"; // תמונת הלוגו של המשתמש
  import LogoutLogo from "./assets/logoutLogo.png"; // תמונת כפתור התנתקות
  import LogoPlayItYourself from "./assets/LogoPlayItYourself.png"; // תמונת הלוגו של האתר


  interface Post {
    _id: string;
    username: string;
    title: string;
    content: string;
    image?: string;
    likesCount: number;
    likedBy: string[];
    commentsList?: Array<{ comment: string; username: string }>; // אם נשאר
    commentsCount?: number;
    owner: {
      username: string;
      profileImage: string;
      _id: string;
    };
  }

  interface LikeResponse {
    likesCount: number;
    likedBy: string[];
  }


  export default function MainPage() { // דף הבית
    const [showModal, setShowModal] = useState(false); // דיאלוג ליצירת פוסט חדש 
    const [postTitle, setPostTitle] = useState(""); // כותרת הפוסט
    const [postContent, setPostContent] = useState(""); // תוכן הפוסט 
    const [postImage, setPostImage] = useState<File | null>(null); // תמונה לפוסט
    const [posts, setPosts] = useState<Post[]>([]); // רשימה של פוסטים
    const [showCommentModal, setShowCommentModal] = useState<string | null>(null); // דיאלוג להוספת תגובה לפוסט
    const [commentText, setCommentText] = useState<string>(""); // תוכן התגובה
    const [comments, setComments] = useState<{ comment: string; owner:{username: string} }[]>([]); // רשימה של תגובות לפוסט
const [viewCommentsPostId, setViewCommentsPostId] = useState<string | null>(null); // מזהה הפוסט שפתוח לתגובות

console.log('viewCommentsPostId', viewCommentsPostId);

const fetchComments = async (postId: string) => {
  try {
    const response = await axios.get<{  comment: string; owner:{username: string} }[] >(`http://localhost:3001/api/comments/${postId}`);
    console.log(response.data);
    
    setComments(response.data);
    setViewCommentsPostId(postId); // פותח את המודל
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    setComments([]);
    alert("טעינת תגובות נכשלה");
  }
};

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

    const [page, setPage] = useState(1); // PAGING

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/posts?page=${page}&limit=5`);
          const data = await response.json();
          console.log("Fetched posts:", data);
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        } catch (err) {
          console.error("Failed to fetch posts:", err);
        }
      };
    
      fetchPosts();
    }, [page]);
    
    

    return (
      <div className="pageWrapper">
        <div className="pageHeader">
          <h1 className="pageTitle">Discover New Fun</h1>
        </div>



        <div className="floating-buttons">
        <div className="leftButtons">
          

             {/* לוגו בראש סרגל הצד */}
    <div className="sidebarLogo">
      <img src={LogoPlayItYourself} alt="PlayItYourself Logo" className="logoImage" />
    </div>

    <div className="sideLine"></div>

    {/* כפתור פרופיל */}
    <div className="sidebarButton">
  <div className="userProfileLogo" onClick={handleProfileRedirect}>
    <img src={ProfileLogo} alt="User Profile" className="userLogoImage" />
  </div>
  <span className="buttonLabel">Profile</span>
</div>



{/* כפתור התנתקות */}
<div className="sidebarButton">
  <button onClick={handleLogout} className="logoutButton">
    <img src={LogoutLogo} alt="Logout" className="logoutIcon" />
  </button>
  <span className="buttonLabel">Logout</span>
</div>

{/* כפתור הוספת פוסט */}
  <button onClick={() => setShowModal(true)} className="addPostButton">
            +
          </button>
          <span className="buttonLabel"></span>

</div>
</div>
    


        {Array.isArray(posts) &&
          posts.map((post) => (
            <div key={post._id} className="postCard">

<div className="postUsernameWithImage">
  <img src={post.owner.profileImage || "/default-profile.png"} alt="User" className="postUserProfileImage" />
  <span className="postUsername">{post.owner?.username|| "Unknown User"}</span>
</div>
<div className="postTitle">{post.title}</div>



<p className="postContent">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="post" className="postImage" />
              )}
             <div className="postFooter">
  {/* כפתור לייק בצד שמאל */}
  <button className="modernBtn" onClick={() => onLike(post._id)}>
  ❤️ {post.likesCount}
</button>


  {/* כפתור הוספת תגובה */}
  <button
    className="modernBtn"
    onClick={() => {
      setCommentText("");
      setShowCommentModal(post._id);
    }}
  >
    Add Comment
  </button>

  {/* כפתור צפייה בתגובות */}
  <button className="modernBtn" onClick={() => fetchComments(post._id)}>
  View Comments ({post.commentsCount ?? 0})
    </button>

  {/* רשימת תגובות (אם קיימת) */}
  {viewCommentsPostId && (
    <CommentList
      comments={comments}
      setViewCommentsPostId={setViewCommentsPostId}
    />
  )}
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
                        
                        // עדכון ספירת תגובות לפוסט
                        setPosts((prevPosts) =>
                          prevPosts.map((p) =>
                            p._id === post._id
                              ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 }
                              : p
                          )
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

{posts.length > 0 && ( // אם יש פוסטים, הראה כפתור "טען עוד"
  <button onClick={() => setPage((prev) => prev + 1)} className="loadMoreBtn">
    טען עוד
  </button>
)}


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


  function CommentList({comments, setViewCommentsPostId}:{comments:{owner:{username:string}, comment:string }[], setViewCommentsPostId:(state:string|null)=>void}){

    return(<div className="modalOverlay">
      <div className="modalContent">
        <button onClick={() => setViewCommentsPostId(null)} className="closeButton">
          ✕
        </button>
        <h2 className="text-xl font-bold text-center">תגובות</h2>
        {comments.length === 0 ? (
          <p>אין תגובות עדיין</p>
        ) : (
          comments.map((c, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{c.owner.username}:</strong> {c.comment}
            </div>
          ))
        )}
      </div>
    </div>)
  }
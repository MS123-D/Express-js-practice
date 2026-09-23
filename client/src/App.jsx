import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/posts");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Unable to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return false;
    }

    if (!body.trim()) {
      setError("Body cannot be empty.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setPosts((currentPosts) => [...currentPosts, data]);

      setTitle("");
      setBody("");
      setError("");
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Unable to create post.");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === editingId ? data : post
        )
      );

      handleCancel();
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Unable to update post.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/posts/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setError("Unable to delete post.");
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== deleteId)
      );

      if (editingId === deleteId) {
        handleCancel();
      }

      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Unable to delete post.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setError("");
  };

  return (
    <div className="app">
      <header className="page-header">
        <div>
          <h1>Posts</h1>
          <p className="subtitle">
            Create, edit and manage your posts.
          </p>
        </div>
      </header>

      <main className="container">
        <section className="form-card">
          <div className="section-heading">
            <h2>
              {editingId === null ? "Create a new post" : "Edit post"}
            </h2>

            {editingId !== null && (
              <span className="editing-label">Editing</span>
            )}
          </div>

          <form
            onSubmit={
              editingId === null ? handleSave : handleUpdate
            }
          >
            <div className="form-group">
              <label htmlFor="title">Title</label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
                placeholder="Enter post title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="body">Body</label>

              <textarea
                id="body"
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  setError("");
                }}
                placeholder="Write your post here..."
                rows="5"
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingId === null ? "Save Post" : "Update Post"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="posts-section">
          <div className="posts-header">
            <div>
              <h2>All Posts</h2>
              <p>
                {posts.length}{" "}
                {posts.length === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Create your first post using the form above.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <article className="post-card" key={post.id}>
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                  </div>

                  <div className="post-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => setDeleteId(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        
        {deleteId !== null && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <div className="modal-icon">!</div>

              <h2>Delete post?</h2>

              <p>
                Are you sure you want to delete this post?
                This action cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  className="modal-cancel-button"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>

                <button
                  className="modal-delete-button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
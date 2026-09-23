const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const posts = [
  {
    id: 1,
    title: "My first post",
    body: "This is my first post."
  },
  {
    id: 2,
    title: "Learning Express",
    body: "I am learning Express.js."
  }
];

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = Number(req.params.id);

  const post = posts.find((post) => post.id === id);

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  res.json(post);
});

app.post("/posts", (req, res) => {
  const { title, body } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      message: "Title must be at least 3 characters"
    });
  }

  if (!body || !body.trim()) {
    return res.status(400).json({
      message: "Body cannot be empty"
    });
  }

  const newPost = {
    id: posts.length === 0
        ? 1
        : Math.max(...posts.map((post) => post.id)) + 1,
    title: title.trim(),
    body: body.trim()
  };

  posts.push(newPost);

  res.status(201).json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, body } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      message: "Title must be at least 3 characters"
    });
  }

  if (!body || !body.trim()) {
    return res.status(400).json({
      message: "Body cannot be empty"
    });
  }

  const post = posts.find((post) => post.id === id);

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  post.title = title.trim();
  post.body = body.trim();

  res.json(post);
});

app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);

  const postIndex = posts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  const deletedPost = posts.splice(postIndex, 1);

  res.json({
    message: "Post deleted successfully",
    post: deletedPost[0]
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
const express = require("express");
const cors = require("cors");
const yup = require("yup");
const mongoose = require("mongoose");
const Post = require("./models/Post");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const postSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .required("Title is required"),

  body: yup
    .string()
    .trim()
    .required("Body cannot be empty"),
});

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);

    res.status(500).json({
      message: "Unable to fetch posts",
    });
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);

    res.status(500).json({
      message: "Unable to fetch post",
    });
  }
});

app.post("/posts", async (req, res) => {
  try {
    const validatedData = await postSchema.validate(req.body, {
      abortEarly: false,
    });

    const newPost = await Post.create({
      title: validatedData.title,
      body: validatedData.body,
    });

    res.status(201).json(newPost);
  } catch (error) {
    if (error instanceof yup.ValidationError) {   
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    console.error("Error creating post:", error);

    res.status(500).json({
      message: "Unable to create post",
    });
  }
});

app.put("/posts/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const validatedData = await postSchema.validate(req.body, {
      abortEarly: false,
    });

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.title = validatedData.title;
    post.body = validatedData.body;

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);

    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Unable to update post",
    });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    res.status(500).json({
      message: "Unable to delete post",
    });
  }
});

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "expressPosts",
  })
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Post = require("./models/Post");
const { createClient } = require("redis");
const postController = require("./controllers/postController");
require("dotenv").config();

const app = express();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/posts", postController.getPosts);

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

app.post("/posts", postController.createPost);

app.put("/posts/:id", postController.updatePost);

app.delete("/posts/:id", postController.deletePost);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "expressPosts",
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    await redisClient.connect();
    console.log("Connected to Redis");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Connection failed:", error);
  });

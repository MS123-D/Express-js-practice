const postInteractor = require("../interactors/postInteractor");
const yup = require("yup");

const getPosts = async (req, res) => {
  try {
    const posts = await postInteractor.getPosts(req.redisClient);

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);

    res.status(500).json({
      message: "Unable to fetch posts",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const newPost = await postInteractor.createPost(
      req.body,
      req.redisClient
    );

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
};

const updatePost = async (req, res) => {
  try {
    const updatedPost = await postInteractor.updatePost(
      req.params.id,
      req.body,
      req.redisClient
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(updatedPost);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    console.error("Error updating post:", error);

    res.status(500).json({
      message: "Unable to update post",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const deletedPost = await postInteractor.deletePost(
      req.params.id,
      req.redisClient
    );

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
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};

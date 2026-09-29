const Post = require("../models/Post");

const getAllPosts = async () => {
  return await Post.find();
};

const createPost = async (postData) => {
    return await Post.create(postData)
}

const updatePost = async (id, postData) => {
  const post = await Post.findById(id);

  if (!post) {
    return null;
  }

  post.title = postData.title;
  post.body = postData.body;

  return await post.save();
};

const deletePost = async (id) => {
  return await Post.findByIdAndDelete(id);
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
};
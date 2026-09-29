const yup = require("yup");

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

const postRepository = require("../repositories/postRepository");

const getPosts = async (redisClient) => {
  const cachedPosts = await redisClient.get("posts");

  if (cachedPosts) {
    console.log("Posts found in Redis cache");
    return JSON.parse(cachedPosts);
  }

  console.log("Posts not found in Redis. Fetching from MongoDB...");

  const posts = await postRepository.getAllPosts();

  await redisClient.set("posts", JSON.stringify(posts));

  return posts;
};

const createPost = async (postData, redisClient) => {
  const validatedData = await postSchema.validate(postData, {
    abortEarly: false,
  });

  const newPost = await postRepository.createPost(validatedData);

  await redisClient.del("posts");

  return newPost;
};

const updatePost = async (id, postData, redisClient) => {
  const validatedData = await postSchema.validate(postData, {
    abortEarly: false,
  });

  const updatedPost = await postRepository.updatePost(id, validatedData);

  if (!updatedPost) {
    return null;
  }

  await redisClient.del("posts");

  return updatedPost;
};

const deletePost = async (id, redisClient) => {
  const deletedPost = await postRepository.deletePost(id);

  if (!deletedPost) {
    return null;
  }

  await redisClient.del("posts");

  return deletedPost;
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};


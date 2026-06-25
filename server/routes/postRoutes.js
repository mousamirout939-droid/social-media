const express = require("express");
const { body } = require("express-validator");
const {
  createPost,
  getFeed,
  getExplorePosts,
  getUserPosts,
  getPostById,
  deletePost,
  toggleLike,
  toggleSave,
  getSavedPosts,
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/feed", protect, getFeed);
router.get("/explore", optionalAuth, getExplorePosts);
router.get("/saved/all", protect, getSavedPosts);
router.get("/user/:username", optionalAuth, getUserPosts);

router.post(
  "/",
  protect,
  upload.single("image"),
  [body("text").optional().trim().isLength({ max: 500 })],
  validate,
  createPost
);

router.get("/:id", optionalAuth, getPostById);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, toggleLike);
router.put("/:id/save", protect, toggleSave);

module.exports = router;

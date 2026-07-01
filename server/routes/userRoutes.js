// File: server/routes/userRoutes.js
const express = require("express");
const { body } = require("express-validator");
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  toggleFollow,
  searchUsers,
  getSuggestions,
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/search", searchUsers);
router.get("/suggestions", protect, getSuggestions);

router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().isLength({ max: 50 }),
    body("bio").optional().trim().isLength({ max: 160 }),
    body("location").optional().trim().isLength({ max: 60 }),
    body("website").optional().trim().isLength({ max: 100 }),
  ],
  validate,
  updateProfile
);

router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/cover", protect, upload.single("cover"), updateCoverImage);
router.put("/:id/follow", protect, toggleFollow);
router.get("/:username", optionalAuth, getUserProfile);

module.exports = router;
const express = require("express");
const { body } = require("express-validator");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/:postId", getComments);
router.post(
  "/:postId",
  protect,
  [body("text").trim().notEmpty().withMessage("Comment cannot be empty").isLength({ max: 300 })],
  validate,
  addComment
);
router.delete("/:id", protect, deleteComment);

module.exports = router;

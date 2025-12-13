const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const registerValidation = [
  body("email").isEmail().withMessage("Некорректный email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен содержать минимум 6 символов"),
  body("name").notEmpty().withMessage("Имя обязательно"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Некорректный email"),
  body("password").notEmpty().withMessage("Пароль обязателен"),
];

const updateProfileValidation = [
  body("email").optional().isEmail().withMessage("Некорректный email"),
  body("name").optional().notEmpty().withMessage("Имя не может быть пустым"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Некорректный номер телефона"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Некорректная дата рождения"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateProfileValidation, updateProfile);

module.exports = router;

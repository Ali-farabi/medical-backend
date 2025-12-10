const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Введите корректный email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен быть минимум 6 символов"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Имя обязательно")
    .isLength({ min: 2 })
    .withMessage("Имя должно быть минимум 2 символа"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Введите корректный email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Пароль обязателен"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;

cat > (src / routes / authRoutes.js) << "EOF";
import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

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
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfileValidation, updateProfile);

export default router;
EOF;

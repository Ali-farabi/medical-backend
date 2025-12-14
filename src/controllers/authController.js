import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации",
        errors: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Пользователь с таким email уже существует",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "user",
    });

    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "Регистрация прошла успешно",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при регистрации",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log("========================================");
    console.log("login");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(
        "Validation errors:",
        JSON.stringify(errors.array(), null, 2)
      );
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    console.log(email);

    const user = await User.findByEmail(email);
    console.log("Database query completed");
    console.log(user ? "YES" : "NO");

    if (!user) {
      console.log("not found:", email);
      console.log("========================================");
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    console.log("User found in database:");
    console.log("  - ID:", user.id);
    console.log("  - Email:", user.email);
    console.log("  - Role:", user.role);

    const isPasswordValid = await comparePassword(password, user.password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("PASSWORD INVALID");
      console.log("========================================");
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    console.log("PASSWORD VALID - generating token...");
    const token = generateToken(user.id);
    console.log("Token generated successfully");

    const { password: _, ...userWithoutPassword } = user;

    console.log("LOGIN SUCCESSFUL for user:", email);
    console.log("========================================");

    res.status(200).json({
      success: true,
      message: "Авторизация успешна",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    console.error("Error stack:", error.stack);
    console.log("========================================");
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при авторизации",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { name, email, phone, address, avatar } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    if (email && email !== existingUser.email) {
      const emailExists = await User.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Пользователь с таким email уже существует",
        });
      }
    }

    const updatedUser = await User.update(userId, {
      name,
      email,
      phone,
      address,
      avatar,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Профиль успешно обновлен",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обновлении профиля",
      error: error.message,
    });
  }
};

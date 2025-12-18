import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import pool from "../config/db.js";

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

export const getAllUsers = async (req, res) => {
  try {
    console.log("========================================");
    console.log("GET ALL USERS request from user:", req.user.id);

    const result = await pool.query(
      `SELECT 
        id,
        email,
        name,
        role,
        avatar,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC`
    );

    console.log(`Found ${result.rows.length} users`);
    console.log("========================================");

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении списка пользователей",
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    console.log("========================================");
    console.log("GET USER STATS request from user:", req.user.id);

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users`
    );

    console.log("User statistics:", result.rows[0]);
    console.log("========================================");

    res.json({
      success: true,
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении статистики",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id,
        email,
        name,
        role,
        avatar,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении данных пользователя",
      error: error.message,
    });
  }
};

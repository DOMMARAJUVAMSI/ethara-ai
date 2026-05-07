import bcrypt from "bcrypt";

import { get, run } from "../config/database.js";
import generateToken from "../utils/generateToken.js";
import httpError from "../utils/httpError.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(httpError("Name, email, and password are required", 400));
    }

    const existingUser = get("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUser) {
      return next(httpError("User already exists with this email", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword
    ]);
    const user = get("SELECT id, name, email FROM users WHERE id = ?", [Number(result.lastInsertRowid)]);

    const token = generateToken(user);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(httpError("Email and password are required", 400));
    }

    const user = get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return next(httpError("Invalid email or password", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(httpError("Invalid email or password", 401));
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

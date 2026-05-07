import jwt from "jsonwebtoken";

import { get } from "../config/database.js";
import httpError from "../utils/httpError.js";

export const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(httpError("Not authorized, token missing", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = get("SELECT id, name, email FROM users WHERE id = ?", [decoded.userId]);

    if (!user) {
      return next(httpError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(httpError("Not authorized, token invalid", 401));
  }
};

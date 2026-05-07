import { get } from "../config/database.js";
import httpError from "../utils/httpError.js";

export const requireProjectAdmin = async (req, _res, next) => {
  try {
    const projectId = Number(req.params.id || req.params.projectId || req.body.projectId);

    if (!projectId) {
      return next(httpError("Project id is required", 400));
    }

    const membership = get(
      "SELECT * FROM project_members WHERE projectId = ? AND userId = ?",
      [projectId, req.user.id]
    );

    if (!membership || membership.role !== "ADMIN") {
      return next(httpError("Admin access required for this project", 403));
    }

    req.projectMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectMember = async (req, _res, next) => {
  try {
    const projectId = Number(req.params.id || req.params.projectId || req.body.projectId);

    if (!projectId) {
      return next(httpError("Project id is required", 400));
    }

    const membership = get(
      "SELECT * FROM project_members WHERE projectId = ? AND userId = ?",
      [projectId, req.user.id]
    );

    if (!membership) {
      return next(httpError("You do not have access to this project", 403));
    }

    req.projectMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};
